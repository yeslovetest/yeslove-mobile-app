import pytest


@pytest.fixture
def signed_in(app, monkeypatch):
    from app.utils import utils

    claims = {"sub": "kc-1", "preferred_username": "newmember", "email": "new@example.com",
              "realm_access": {"roles": ["standard"]}}
    monkeypatch.setattr(utils, "verify_jwt", lambda token: claims)
    return claims


def post(client):
    return client.post("/api/auth/session", headers={"Authorization": "Bearer t"})


def test_requires_a_token(client):
    assert client.post("/api/auth/session").status_code == 401


def test_first_browser_sign_in_creates_the_local_account(client, signed_in):
    from app.models import User

    body = post(client).get_json()
    assert body["keycloak_id"] == "kc-1" and body["username"] == "newmember" and body["user_type"] == "standard"
    assert User.query.filter_by(keycloak_id="kc-1").one().id == body["user_id"]


def test_it_is_idempotent(client, signed_in):
    from app.models import User

    first = post(client).get_json()["user_id"]
    assert post(client).get_json()["user_id"] == first
    assert User.query.count() == 1


def test_an_existing_account_with_the_same_username_is_linked(client, signed_in):
    from app import db
    from app.models import User

    db.session.add(User(keycloak_id="old-id", username="newmember", email="old@example.com"))
    db.session.commit()
    body = post(client).get_json()
    assert User.query.count() == 1 and body["keycloak_id"] == "kc-1"


def test_professionals_are_told_their_details_are_missing(client, signed_in):
    signed_in["realm_access"] = {"roles": ["professional"]}
    body = post(client).get_json()
    assert body["user_type"] == "professional" and body["set_professional_details_required"] is True
