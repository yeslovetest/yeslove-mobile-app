from unittest.mock import Mock

import pytest
import requests


@pytest.fixture
def directory(app, monkeypatch):
    from app.utils import utils
    from app.services import wordpress_professional_service as service
    monkeypatch.setattr(utils, "verify_jwt", lambda token: {"sub": "test-user"})
    app.config.update(PROFESSIONALS_SOURCE="wordpress", WORDPRESS_DIRECTORY_USERNAME="test",
                      WORDPRESS_DIRECTORY_APPLICATION_PASSWORD="test-password")
    upstream = Mock(status_code=200, headers={"X-WP-Total": "21", "X-WP-TotalPages": "2"})
    upstream.json.return_value = [{"id": 9, "name": "Jane &amp; Doe", "description": "<p>Therapist</p>",
                                 "email": "private@example.invalid", "avatar_urls": {"96": "https://example.invalid/photo.png"}}]
    get = Mock(return_value=upstream)
    monkeypatch.setattr(service.requests, "get", get)
    return upstream, get


def fetch(client, query=""):
    return client.get("/api/events/professionals" + query, headers={"Authorization": "Bearer test"})


def test_directory_requires_login(client, directory):
    assert client.get("/api/events/professionals").status_code == 401
    directory[1].assert_not_called()


def test_website_mapping_search_and_pagination(client, directory):
    response = fetch(client, "?page=2&per_page=20&search=Jane")
    assert response.status_code == 200
    data = response.get_json()
    assert data["professionals"][0]["username"] == "Jane & Doe"
    assert data["professionals"][0]["bio"] == "Therapist"
    assert "email" not in data["professionals"][0]
    assert data["pagination"]["has_prev"] is True
    assert data["pagination"]["has_next"] is False
    kwargs = directory[1].call_args.kwargs
    assert kwargs["params"]["roles"] == "professional"
    assert kwargs["params"]["search"] == "Jane"
    assert kwargs["allow_redirects"] is False
    assert kwargs["timeout"] == (3, 10)


def test_missing_credentials_is_not_an_empty_directory(client, app, directory):
    app.config["WORDPRESS_DIRECTORY_APPLICATION_PASSWORD"] = None
    assert fetch(client).status_code == 503
    directory[1].assert_not_called()


@pytest.mark.parametrize("status", [301, 401, 403, 500])
def test_upstream_failure(client, directory, status):
    directory[0].status_code = status
    assert fetch(client).status_code == 502


@pytest.mark.parametrize("error,status", [(requests.Timeout(), 504), (requests.ConnectionError(), 502)])
def test_network_failure(client, directory, error, status):
    directory[1].side_effect = error
    assert fetch(client).status_code == status


def test_invalid_response(client, directory):
    directory[0].json.return_value = {"error": "private upstream details"}
    response = fetch(client)
    assert response.status_code == 502
    assert "private" not in response.get_data(as_text=True)


def test_empty_directory(client, directory):
    directory[0].json.return_value = []
    directory[0].headers = {"X-WP-Total": "0", "X-WP-TotalPages": "0"}
    assert fetch(client).get_json()["professionals"] == []
