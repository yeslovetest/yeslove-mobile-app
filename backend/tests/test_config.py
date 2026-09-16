from pathlib import Path
import os
import runpy
import shutil
import subprocess
import sys

import pytest


@pytest.mark.parametrize("value,expected", [("true", True), ("false", False), (" TRUE ", True)])
def test_storage_flag_has_same_meaning_in_both_environments(monkeypatch, value, expected):
    monkeypatch.setenv("USE_S3_STORAGE", value)
    config = runpy.run_path(str(Path(__file__).resolve().parents[1] / "app" / "config.py"))
    assert config["DevelopmentConfig"].USE_S3_STORAGE is expected
    assert config["ProductionConfig"].USE_S3_STORAGE is expected


def test_production_accepts_legacy_database_uri(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("DATABASE_URI", "sqlite://")
    config = runpy.run_path(str(Path(__file__).resolve().parents[1] / "app" / "config.py"))
    assert config["ProductionConfig"].SQLALCHEMY_DATABASE_URI == "sqlite://"


def test_factory_honours_production_environment(monkeypatch):
    import app
    from app.config import ProductionConfig

    monkeypatch.setenv("FLASK_ENV", "production")
    monkeypatch.setattr(ProductionConfig, "GRAPH_DB_URI", "")
    monkeypatch.setattr(ProductionConfig, "NEO4J_URI", "")
    monkeypatch.setattr(app, "get_keycloak_public_keys", lambda: None)

    application = app.create_app()
    assert application.debug is False
    assert application.config["SQLALCHEMY_DATABASE_URI"] == "sqlite://"


def test_testing_factory_starts_without_optional_services(app):
    assert app.testing is True
    assert app.debug is False
    assert not hasattr(app, "graph_driver")


def test_dotenv_is_loaded_before_configuration_classes(tmp_path):
    # Exercise a clean import against a disposable .env, never the repository's
    # deployment settings or database files.
    source = Path(__file__).resolve().parents[1] / "app"
    shutil.copytree(source, tmp_path / "app", ignore=shutil.ignore_patterns(".env*", "__pycache__"))
    (tmp_path / ".env").write_text(
        "KEYCLOAK_CLIENT_ID=env-file-client\nUSE_S3_STORAGE=true\nDATABASE_URL=sqlite://\n"
    )
    env = os.environ.copy()
    for key in ("PYTHON_DOTENV_DISABLED", "KEYCLOAK_CLIENT_ID", "USE_S3_STORAGE", "DATABASE_URL"):
        env.pop(key, None)
    script = """
import socket
def block(*args, **kwargs):
    raise AssertionError('Live network calls are forbidden')
socket.socket.connect = block
from app.config import DevelopmentConfig, ProductionConfig
assert DevelopmentConfig.KEYCLOAK_CLIENT_ID == 'env-file-client'
assert DevelopmentConfig.USE_S3_STORAGE is True
assert ProductionConfig.SQLALCHEMY_DATABASE_URI == 'sqlite://'
"""
    result = subprocess.run([sys.executable, "-c", script], cwd=tmp_path, env=env, capture_output=True, text=True, timeout=30)
    assert result.returncode == 0, result.stderr
