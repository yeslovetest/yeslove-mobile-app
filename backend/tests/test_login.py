from unittest.mock import Mock

import pytest
import requests


@pytest.mark.parametrize("roles", [[], ["professional"]])
def test_login_keeps_tokens_and_returns_local_identity(client, monkeypatch, roles):
    from app import utils
    from app.api.auth import auth_routes
    from app.models import User

    tokens = {"access_token": "test-access-token", "refresh_token": "test-refresh-token"}
    upstream = Mock(status_code=200)
    upstream.json.return_value = tokens.copy()
    post = Mock(return_value=upstream)
    monkeypatch.setattr(auth_routes.requests, "post", post)
    monkeypatch.setattr(utils, "verify_jwt", lambda token: {
        "sub": "test-user",
        "preferred_username": "leo",
        "email": "leo@example.invalid",
        "realm_access": {"roles": roles},
    })

    response = client.post("/api/auth/login", json={"username": "leo", "password": "test-password"})
    data = response.get_json()

    assert response.status_code == 200
    assert data["access_token"] == tokens["access_token"]
    assert data["refresh_token"] == tokens["refresh_token"]
    assert data["keycloak_id"] == "test-user"
    assert data["user_id"] == User.query.one().id
    if roles:
        assert data["set_professional_details_required"] is True
    assert post.call_args.kwargs["timeout"] == auth_routes.AUTH_REQUEST_TIMEOUT


@pytest.mark.parametrize("path,payload", [
    ("/api/auth/login", {"username": "leo", "password": "test-password"}),
    ("/api/auth/refresh_token", {"refresh_token": "test-refresh-token"}),
])
@pytest.mark.parametrize("error,status", [(requests.Timeout, 504), (requests.ConnectionError, 503)])
def test_auth_service_failure_returns_retryable_error(client, monkeypatch, path, payload, error, status):
    from app.api.auth import auth_routes

    monkeypatch.setattr(auth_routes.requests, "post", Mock(side_effect=error))
    response = client.post(path, json=payload)
    assert response.status_code == status
    assert "message" in response.get_json()


def test_refresh_rejects_missing_payload(client):
    response = client.post("/api/auth/refresh_token", json={})
    assert response.status_code == 400


def test_identity_endpoint_requires_authentication(client):
    response = client.post("/api/profile/user/keycloak_id")
    assert response.status_code == 401
