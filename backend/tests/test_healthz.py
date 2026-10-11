from unittest import mock


def test_healthz_is_public_and_says_nothing_about_members(client):
    response = client.get("/healthz")
    assert response.status_code == 200 and response.get_json() == {"status": "ok"}


def test_healthz_reports_unavailable_when_the_database_is_down(client):
    with mock.patch("app.db.session.execute", side_effect=RuntimeError("db down")):
        response = client.get("/healthz")
    assert response.status_code == 503 and response.get_json() == {"status": "unavailable"}
