from unittest.mock import Mock

import pytest
import requests

def member(wp_id, name, bio="", avatar="https://example.invalid/photo.png", extra=()):
    """A BuddyPress member as the website returns it (only what the member made public)."""
    fields = [{"name": "Bio", "value": {"rendered": bio}}] + [{"name": n, "value": {"rendered": v}} for n, v in extra]
    return {"id": wp_id, "name": name, "avatar_urls": {"full": avatar, "thumb": avatar},
            "member_types": ["professionals"], "xprofile": {"groups": [{"name": "Bio", "fields": fields}]}}


PEOPLE = [
    member(9, "Jane &amp; Doe", "<p>Therapist</p>",
           extra=[("Email:", "private@example.invalid"), ("Birthday", "1 Jan 1980"), ("Phone:", "07000000000")]),
    member(4, "Alan Smith", "Counsellor", avatar=None),
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
    app.config.update(PROFESSIONALS_SOURCE="wordpress")
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
    assert set(jane) == {"id", "source", "keycloak_id", "username", "bio", "profile_pic", "specialization", "license_body"}
    kwargs = wordpress.call_args.kwargs
    assert wordpress.call_args.args[0].endswith("/buddypress/v1/members")
    assert kwargs["params"]["member_type"] == "professionals"
    assert "auth" not in kwargs  # no login is sent to the website
    assert "type" not in kwargs["params"]  # on the live site `type` makes the member_type filter be ignored
    assert kwargs["allow_redirects"] is False and kwargs["timeout"] == (3, 10)


def test_contact_details_are_never_stored(client, wordpress):
    from app.models import WordPressProfessional

    sync()
    stored = " ".join(str(v) for row in WordPressProfessional.query.all() for v in vars(row).values())
    for private in ("private@example.invalid", "07000000000", "1 Jan 1980"):
        assert private not in stored


def test_bio_falls_back_to_how_i_can_help(client, wordpress):
    wordpress.return_value = upstream_page([member(5, "No Bio", "", extra=[("How I can help", "Anxiety support")])])
    sync()
    assert fetch(client).get_json()["professionals"][0]["bio"] == "Anxiety support"


def test_search_and_pagination_use_the_copy(client, wordpress):
    sync()
    assert [p["username"] for p in fetch(client, "?search=jane").get_json()["professionals"]] == ["Jane & Doe"]
    second = fetch(client, "?per_page=1&page=2").get_json()
    assert second["professionals"][0]["username"] == "Jane & Doe"
    assert second["pagination"]["has_prev"] is True and second["pagination"]["has_next"] is False


def test_resync_updates_adds_and_removes(client, wordpress):
    sync()
    changed = [member(9, "Jane &amp; Doe", "Psychotherapist"), member(11, "New Person", "")]
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
    app.config["WORDPRESS_PROFESSIONAL_MEMBER_TYPE"] = None
    assert fetch(client).status_code == 503


def test_configured_but_not_yet_synced_is_an_empty_list(client, wordpress):
    response = fetch(client)
    assert response.status_code == 200 and response.get_json()["professionals"] == []


def test_the_sync_command_needs_configuration(app, wordpress):
    app.config["WORDPRESS_PROFESSIONAL_MEMBER_TYPE"] = None
    result = app.test_cli_runner().invoke(args=["sync-wordpress-professionals"])
    assert result.exit_code != 0 and "not configured" in result.output
    wordpress.assert_not_called()


def test_the_sync_command_reports_counts(app, wordpress):
    result = app.test_cli_runner().invoke(args=["sync-wordpress-professionals"])
    assert result.exit_code == 0 and "added: 2" in result.output


# --- linking a website professional to an app account (so members can message them) ---

def make_professional_account(username="drjane", user_type="professional", details=True):
    from app import db
    from app.models import ProfessionalDetails, User

    user = User(keycloak_id=f"kc-{username}", username=username, email=f"{username}@example.com", user_type=user_type)
    db.session.add(user)
    db.session.flush()
    if details:
        db.session.add(ProfessionalDetails(user_id=user.id, license_body="BACP", license_number="123",
                                           consent_license_data=True))
    db.session.commit()
    return user


def test_unlinked_professionals_have_no_account_to_message(client, wordpress):
    sync()
    assert all(p["keycloak_id"] is None for p in fetch(client).get_json()["professionals"])


def test_a_linked_professional_can_be_messaged(client, wordpress):
    from app.services.wordpress_professional_service import link_professional

    sync()
    make_professional_account()
    link_professional(9, "drjane")
    by_name = {p["username"]: p for p in fetch(client).get_json()["professionals"]}
    assert by_name["Jane & Doe"]["keycloak_id"] == "kc-drjane"
    assert by_name["Alan Smith"]["keycloak_id"] is None


def test_the_link_survives_a_resync(client, wordpress):
    from app.services.wordpress_professional_service import link_professional

    sync()
    make_professional_account()
    link_professional(9, "drjane")
    wordpress.return_value = upstream_page([member(9, "Jane &amp; Doe", "New bio"), PEOPLE[1]])
    sync()
    by_name = {p["username"]: p for p in fetch(client).get_json()["professionals"]}
    assert by_name["Jane & Doe"]["keycloak_id"] == "kc-drjane" and by_name["Jane & Doe"]["bio"] == "New bio"


@pytest.mark.parametrize("setup,message", [
    (dict(user_type="standard"), "not a professional account"),
    (dict(details=False), "not a professional account"),
])
def test_only_real_professional_accounts_can_be_linked(client, wordpress, setup, message):
    from app.services.wordpress_professional_service import LinkError, link_professional

    sync()
    make_professional_account(**setup)
    with pytest.raises(LinkError, match=message):
        link_professional(9, "drjane")


def test_linking_needs_a_synced_professional_and_an_existing_account(client, wordpress):
    from app.services.wordpress_professional_service import LinkError, link_professional

    with pytest.raises(LinkError, match="Run the sync first"):
        link_professional(9, "drjane")
    sync()
    with pytest.raises(LinkError, match="No app account"):
        link_professional(9, "nobody")


def test_one_account_cannot_be_linked_to_two_professionals(client, wordpress):
    from app.services.wordpress_professional_service import LinkError, link_professional

    sync()
    make_professional_account()
    link_professional(9, "drjane")
    with pytest.raises(LinkError, match="already linked"):
        link_professional(4, "drjane")


def test_unlinking(client, wordpress):
    from app.services.wordpress_professional_service import link_professional, unlink_professional

    sync()
    make_professional_account()
    link_professional(9, "drjane")
    unlink_professional(9)
    assert all(p["keycloak_id"] is None for p in fetch(client).get_json()["professionals"])


def test_deleting_the_account_unlinks_the_professional(client, wordpress):
    from app.models import WordPressProfessional
    from app.services.account_service import AccountService
    from app.services.wordpress_professional_service import link_professional

    sync()
    user = make_professional_account()
    link_professional(9, "drjane")
    AccountService.erase_user_data(user)
    assert WordPressProfessional.query.filter_by(wp_user_id=9).one().user_id is None


def test_an_older_table_gets_the_new_column(app):
    from sqlalchemy import inspect, text
    from app import db
    from app.services.wordpress_professional_service import ensure_professional_table

    db.session.remove()
    with db.engine.begin() as connection:
        connection.execute(text("DROP TABLE wordpress_professionals"))
        connection.execute(text(
            "CREATE TABLE wordpress_professionals (id INTEGER PRIMARY KEY, wp_user_id INTEGER NOT NULL UNIQUE, "
            "name VARCHAR(255) NOT NULL, bio TEXT, avatar_url VARCHAR(500), synced_at DATETIME NOT NULL)"))
    ensure_professional_table(db)
    assert "user_id" in {c["name"] for c in inspect(db.engine).get_columns("wordpress_professionals")}
    ensure_professional_table(db)  # safe to run again


def test_the_link_commands(app, wordpress):
    sync()
    make_professional_account()
    runner = app.test_cli_runner()
    listed = runner.invoke(args=["list-wordpress-professionals"])
    assert "not linked" in listed.output
    linked = runner.invoke(args=["link-wordpress-professional", "9", "drjane"])
    assert linked.exit_code == 0 and "Linked website professional 9" in linked.output
    assert "linked to drjane" in runner.invoke(args=["list-wordpress-professionals"]).output
    bad = runner.invoke(args=["link-wordpress-professional", "9", "nobody"])
    assert bad.exit_code != 0 and "No app account" in bad.output
    assert runner.invoke(args=["link-wordpress-professional", "9", "--unlink"]).exit_code == 0
