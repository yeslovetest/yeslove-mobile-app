"""Run regression tests without loading deployment credentials or using live services."""
import os
import socket
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.update({
    "PYTHON_DOTENV_DISABLED": "1",
    "FLASK_ENV": "testing",
    "DATABASE_URL": "sqlite://",
    "DATABASE_URI": "sqlite://",
    "KEYCLOAK_SERVER_URL": "https://auth.example.invalid",
    "KEYCLOAK_CLIENT_SECRET": "test-client-secret",
    "REDIS_URL": "redis://127.0.0.1:9/0",
    "ENABLE_EMBEDDED_CHATBOT": "false",
})


@pytest.fixture(autouse=True)
def block_network(monkeypatch):
    def blocked(*args, **kwargs):
        raise AssertionError("Live network calls are forbidden in regression tests")

    monkeypatch.setattr(socket.socket, "connect", blocked)


@pytest.fixture
def app():
    from app import create_app, db
    from app.config import TestingConfig

    class IsolatedConfig(TestingConfig):
        SQLALCHEMY_DATABASE_URI = "sqlite://"

    application = create_app(IsolatedConfig)
    with application.app_context():
        db.create_all()
        yield application
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()
