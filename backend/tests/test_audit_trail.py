from datetime import datetime, timedelta
from unittest import mock

import pytest


@pytest.fixture
def who(app, monkeypatch):
    """Sign in as an admin or a member by changing `who.claims`."""
    from app import db
    from app.models import User
    from app.utils import utils

    admin = User(keycloak_id="kc-admin", username="boss", email="b@example.com", user_type="standard")
    member = User(keycloak_id="kc-member", username="member", email="m@example.com")
    db.session.add_all([admin, member])
    db.session.commit()

    class Who:
        admin_user, member_user = admin, member
        claims = {"sub": "kc-admin", "preferred_username": "boss", "realm_access": {"roles": ["admin"]}}

    monkeypatch.setattr(utils, "verify_jwt", lambda token: Who.claims)
    return Who


def get(client, path, **kw):
    return client.get(path, headers={"Authorization": "Bearer t"}, **kw)


def events():
    from app.models import AuditEvent

    return AuditEvent.query.order_by(AuditEvent.id).all()


def test_an_admin_viewing_logs_is_recorded(client, who):
    assert get(client, "/api/admin/moderation/logs").status_code == 200
    [event] = events()
    assert (event.action, event.actor_role, event.outcome) == ("admin.moderation_logs.list", "admin", "ok")
    assert event.actor_user_id == who.admin_user.id and event.actor_keycloak_id == "kc-admin"


def test_a_refused_attempt_is_recorded_too(client, who):
    who.claims = {"sub": "kc-member", "preferred_username": "member", "realm_access": {"roles": ["standard"]}}
    assert get(client, "/api/admin/moderation/logs").status_code == 403
    [event] = events()
    assert (event.actor_role, event.outcome) == ("member", "denied")


def test_acting_on_a_member_records_whose_data(client, who):
    response = client.put(f"/api/admin/moderation/users/{who.member_user.id}/suspend",
                          headers={"Authorization": "Bearer t"}, json={"suspend": True})
    assert response.status_code in (200, 400, 404)
    event = events()[0]
    assert event.action == "admin.user.suspend"
    assert event.subject_user_id == who.member_user.id and event.resource == f"user:{who.member_user.id}"


def test_exporting_your_own_data_is_recorded(client, who):
    who.claims = {"sub": "kc-member", "preferred_username": "member", "realm_access": {"roles": ["standard"]}}
    assert get(client, "/api/auth/export_data").status_code == 200
    [event] = events()
    assert event.action == "account.export" and event.subject_user_id == who.member_user.id


def test_a_failure_to_write_the_trail_never_breaks_the_request(client, who):
    with mock.patch("app.utils.audit.ensure_audit_table"), \
            mock.patch("app.models.AuditEvent.__table__") as table:
        table.insert.side_effect = RuntimeError("disk full")
        assert get(client, "/api/admin/moderation/logs").status_code == 200


def test_the_trail_holds_ids_and_names_but_no_content():
    from app.models import AuditEvent

    columns = {c.name for c in AuditEvent.__table__.columns}
    assert columns == {"id", "occurred_at", "actor_user_id", "actor_keycloak_id", "actor_role", "action",
                       "subject_user_id", "resource", "outcome", "ip_address"}
    assert not AuditEvent.__table__.foreign_keys  # a record outlives the account it is about


def test_admins_can_read_and_filter_the_trail_and_reading_is_recorded(client, who):
    get(client, "/api/admin/moderation/logs")
    get(client, "/api/admin/moderation/reports")
    body = get(client, "/api/admin/audit/events?action=admin.reports").get_json()
    assert [e["action"] for e in body["items"]] == ["admin.reports.list"]
    assert body["pagination"]["total"] == 1
    assert "admin.audit.view" in [e.action for e in events()]  # the read above is in the trail


def test_members_cannot_read_the_trail(client, who):
    who.claims = {"sub": "kc-member", "preferred_username": "member", "realm_access": {"roles": ["standard"]}}
    assert get(client, "/api/admin/audit/events").status_code == 403


def test_bad_filters_are_refused(client, who):
    assert get(client, "/api/admin/audit/events?actor_user_id=abc").status_code == 400
    assert get(client, "/api/admin/audit/events?since=yesterday").status_code == 400


def test_the_retention_job_deletes_events_after_twelve_months(app):
    from app import db
    from app.models import AuditEvent
    from app.services.retention_service import run_retention

    db.session.add_all([
        AuditEvent(action="old", occurred_at=datetime.utcnow() - timedelta(days=400)),
        AuditEvent(action="recent", occurred_at=datetime.utcnow() - timedelta(days=10)),
    ])
    db.session.commit()
    assert run_retention()["audit_events"] == 1
    assert [e.action for e in events()] == ["recent"]


def test_deleting_an_account_keeps_the_audit_rows_but_drops_the_sign_in_id(app, who):
    from app import db
    from app.models import AuditEvent
    from app.services.account_service import AccountService

    db.session.add(AuditEvent(action="account.export", actor_keycloak_id="kc-member",
                              actor_user_id=who.member_user.id, subject_user_id=who.member_user.id))
    db.session.commit()
    AccountService.erase_user_data(who.member_user)
    [event] = events()
    assert event.actor_keycloak_id is None and event.action == "account.export"


def test_linking_a_professional_from_the_command_line_is_recorded(app):
    from app import db
    from app.models import ProfessionalDetails, User, WordPressProfessional

    user = User(keycloak_id="kc-pro", username="drjane", email="j@example.com", user_type="professional")
    db.session.add(user)
    db.session.flush()
    db.session.add_all([
        ProfessionalDetails(user_id=user.id, license_body="BACP", license_number="1", consent_license_data=True),
        WordPressProfessional(wp_user_id=9, name="Jane"),
    ])
    db.session.commit()
    assert app.test_cli_runner().invoke(args=["link-wordpress-professional", "9", "drjane"]).exit_code == 0
    [event] = events()
    assert (event.action, event.actor_role, event.subject_user_id) == ("cli.professional.link", "system", user.id)
