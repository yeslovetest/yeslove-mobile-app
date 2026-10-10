from unittest.mock import Mock

import pytest
import requests

PEOPLE = [
    {"id": 9, "name": "Jane &amp; Doe", "description": "<p>Therapist</p>", "email": "private@example.invalid",
     "avatar_urls": {"96": "https://example.invalid/photo.png"}},
    {"id": 4, "name": "Alan Smith", "description": "Counsellor", "avatar_urls": {}},
]


def upstream_page(people, total=None, pages=1, status=200):
    response = Mock(status_code=status, headers={"X-WP-Total": str(total if total is not None else len(people)),
                                                 "X-WP-TotalPages": str(pages)})
    response.json.return_value = people
    return response


@pytest.fixture
def wordpress(app, monkeypatch):
    """A configured directory whose WordPress answers can be changed per test."""
    from app.utils import utils
    from app.services import wordpress_professional_service as service

    monkeypatch.setattr(utils, "verify_jwt", lambda token: {"sub": "test-user"})
    app.config.update(PROFESSIONALS_SOURCE="wordpress", WORDPRESS_DIRECTORY_USERNAME="test",
                      WORDPRESS_DIRECTORY_APPLICATION_PASSWORD="test-password")
    get = Mock(return_value=upstream_page(PEOPLE))
    monkeypatch.setattr(service.requests, "get", get)
    return get


def fetch(client, query=""):
    return client.get("/api/events/professionals" + query, headers={"Authorization": "Bearer test"})


def sync():
    from app.services.wordpress_professional_service import sync_professionals

    return sync_professionals()


def test_directory_requires_login(client, wordpress):
    assert client.get("/api/events/professionals").status_code == 401


def test_the_api_never_contacts_wordpress(client, wordpress):
    sync()
    wordpress.reset_mock()
    assert fetch(client).status_code == 200
    wordpress.assert_not_called()


def test_sync_copies_and_the_app_reads_the_copy(client, wordpress):
    assert sync() == {"added": 2, "updated": 0, "removed": 0, "total": 2}
    data = fetch(client).get_json()
    assert [p["username"] for p in data["professionals"]] == ["Alan Smith", "Jane & Doe"]
    jane = data["professionals"][1]
    assert jane["bio"] == "Therapist" and jane["profile_pic"] == "https://example.invalid/photo.png"
    assert "email" not in jane
    kwargs = wordpress.call_args.kwargs
    assert kwargs["params"]["roles"] == "professional"
    assert kwargs["allow_redirects"] is False and kwargs["timeout"] == (3, 10)


def test_search_and_pagination_use_the_copy(client, wordpress):
    sync()
    assert [p["username"] for p in fetch(client, "?search=jane").get_json()["professionals"]] == ["Jane & Doe"]
    second = fetch(client, "?per_page=1&page=2").get_json()
    assert second["professionals"][0]["username"] == "Jane & Doe"
    assert second["pagination"]["has_prev"] is True and second["pagination"]["has_next"] is False


def test_resync_updates_adds_and_removes(client, wordpress):
    sync()
    changed = [dict(PEOPLE[0], description="Psychotherapist"), {"id": 11, "name": "New Person", "description": ""}]
    wordpress.return_value = upstream_page(changed)
    assert sync() == {"added": 1, "updated": 1, "removed": 1, "total": 2}
    names = {p["username"]: p["bio"] for p in fetch(client).get_json()["professionals"]}
    assert names == {"Jane & Doe": "Psychotherapist", "New Person": ""}


def test_sync_reads_every_page(client, wordpress):
    wordpress.side_effect = [upstream_page(PEOPLE[:1], total=2, pages=2), upstream_page(PEOPLE[1:], total=2, pages=2)]
    assert sync()["total"] == 2
    assert [c.kwargs["params"]["page"] for c in wordpress.call_args_list] == [1, 2]


@pytest.mark.parametrize("failure", [requests.Timeout(), requests.ConnectionError(), upstream_page([], status=401),
                                     upstream_page({"error": "private details"})])
def test_a_failed_sync_keeps_the_existing_copy(client, wordpress, failure):
    from app.services.wordpress_professional_service import DirectoryError

    sync()
    wordpress.side_effect = [failure] if isinstance(failure, Exception) else None
    if not isinstance(failure, Exception):
        wordpress.return_value = failure
    with pytest.raises(DirectoryError) as caught:
        sync()
    assert "private" not in str(caught.value)
    assert len(fetch(client).get_json()["professionals"]) == 2


def test_an_empty_answer_does_not_wipe_the_copy(client, wordpress):
    from app.services.wordpress_professional_service import DirectoryError

    sync()
    wordpress.return_value = upstream_page([], total=0, pages=0)
    with pytest.raises(DirectoryError):
        sync()
    assert len(fetch(client).get_json()["professionals"]) == 2


def test_not_configured_is_not_an_empty_directory(client, app, wordpress):
    app.config["WORDPRESS_DIRECTORY_APPLICATION_PASSWORD"] = None
    assert fetch(client).status_code == 503


def test_configured_but_not_yet_synced_is_an_empty_list(client, wordpress):
    response = fetch(client)
    assert response.status_code == 200 and response.get_json()["professionals"] == []


def test_the_sync_command_needs_configuration(app, wordpress):
    app.config["WORDPRESS_DIRECTORY_USERNAME"] = None
    result = app.test_cli_runner().invoke(args=["sync-wordpress-professionals"])
    assert result.exit_code != 0 and "not configured" in result.output
    wordpress.assert_not_called()


def test_the_sync_command_reports_counts(app, wordpress):
    result = app.test_cli_runner().invoke(args=["sync-wordpress-professionals"])
    assert result.exit_code == 0 and "added: 2" in result.output
