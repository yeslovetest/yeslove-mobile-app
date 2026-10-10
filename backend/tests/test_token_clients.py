import time
from unittest import mock

import pytest


def claims(**extra):
    base = {"iss": "https://auth.example.invalid/realms/YesLove_Auth", "exp": int(time.time()) + 60,
            "sub": "u1", "preferred_username": "someone", "azp": "yeslove"}
    base.update(extra)
    return base


@pytest.fixture
def verify(monkeypatch):
    from app.utils import utils

    monkeypatch.setenv("KEYCLOAK_SERVER_URL", "https://auth.example.invalid")
    monkeypatch.delenv("ALLOWED_TOKEN_CLIENTS", raising=False)
    monkeypatch.delenv("KEYCLOAK_CLIENT_ID", raising=False)
    monkeypatch.delenv("KEYCLOAK_MOBILE_CLIENT_ID", raising=False)
    monkeypatch.setattr(utils, "get_keycloak_public_keys", lambda: {"keys": []})

    def run(token_claims):
        with mock.patch.object(utils.jwt, "decode", return_value=token_claims):
            return utils.verify_jwt("token")

    return run


def test_both_app_clients_are_accepted(verify):
    assert verify(claims(azp="yeslove")) is not None
    assert verify(claims(azp="yeslove-mobile")) is not None


def test_a_token_from_another_client_is_refused(verify):
    assert verify(claims(azp="admin-cli")) is None
    assert verify(claims(azp="some-other-tool")) is None


def test_a_token_without_a_client_is_refused(verify):
    token = claims()
    del token["azp"]
    assert verify(token) is None


def test_the_allowed_list_can_be_set(verify, monkeypatch):
    monkeypatch.setenv("ALLOWED_TOKEN_CLIENTS", "yeslove-mobile")
    assert verify(claims(azp="yeslove")) is None
    assert verify(claims(azp="yeslove-mobile")) is not None


def test_expired_and_wrong_issuer_are_still_refused(verify):
    assert verify(claims(exp=int(time.time()) - 5)) is None
    assert verify(claims(iss="https://elsewhere.invalid/realms/x")) is None
