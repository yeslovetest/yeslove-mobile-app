"""Audit trail of access to personal data (DTAC C3.6).

record_audit() never raises and never touches the caller's database session: a failure to write
the trail must not break the request, and the write must not commit the caller's half-finished work.
Only ids and action names are stored, never message text or profile content.
"""
from functools import wraps

from flask import has_request_context, request

from app.logging_setup import setup_logger

logger = setup_logger()


def ensure_audit_table(db):
    from app.models import AuditEvent

    AuditEvent.__table__.create(bind=db.engine, checkfirst=True)


def _actor():
    """(user id, keycloak id, role) of whoever made the request, or the system if there is none."""
    if not has_request_context() or not getattr(request, "user", None):
        return None, None, "system"
    from app.models import User

    info = request.user
    keycloak_id = info.get("keycloak_id")
    role = "admin" if "admin" in (info.get("realm_access") or {}).get("roles", []) else "member"
    user = User.query.filter_by(keycloak_id=keycloak_id).first() if keycloak_id else None
    return (user.id if user else None), keycloak_id, role


def _client_ip():
    if not has_request_context():
        return None
    forwarded = request.headers.get("X-Forwarded-For", "")
    return (forwarded.split(",")[0].strip() or request.remote_addr or None)


def record_audit(action, *, subject_user_id=None, resource=None, outcome="ok"):
    try:
        from app import db
        from app.models import AuditEvent

        actor_user_id, actor_keycloak_id, actor_role = _actor()
        row = {
            "actor_user_id": actor_user_id, "actor_keycloak_id": actor_keycloak_id, "actor_role": actor_role,
            "action": action, "subject_user_id": subject_user_id, "resource": (resource or None) and resource[:120],
            "outcome": outcome, "ip_address": (_client_ip() or "")[:64] or None,
        }
        from datetime import datetime
        with db.engine.begin() as connection:
            connection.execute(AuditEvent.__table__.insert().values(occurred_at=datetime.utcnow(), **row))
    except Exception:
        logger.exception("Could not write audit event %s", action)


def audited(action, resource=None, subject=None):
    """Record every call to a route after it answers: who, what, whose data, and whether it was allowed.

    Place it below @require_auth(). `resource` and `subject` take the route's keyword arguments
    (for example the user id in the URL) and return a label and a user id.
    """
    def decorator(handler):
        @wraps(handler)
        def wrapper(*args, **kwargs):
            result = handler(*args, **kwargs)
            status = result[1] if isinstance(result, tuple) and len(result) > 1 and isinstance(result[1], int) else 200
            outcome = "ok" if status < 400 else ("denied" if status in (401, 403) else "error")
            record_audit(
                action, outcome=outcome,
                resource=resource(kwargs) if resource else None,
                subject_user_id=subject(kwargs) if subject else None,
            )
            return result
        return wrapper
    return decorator
