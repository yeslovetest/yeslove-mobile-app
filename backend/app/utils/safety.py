"""Helpers for user blocking, used by the feed, chat and follow routes."""
from sqlalchemy import or_


def blocked_user_ids(user_id: int) -> set:
    """Ids of users the given user has blocked or who have blocked them.

    Blocking hides content in both directions, so callers filter on the union.
    """
    from app.models import UserBlock

    rows = UserBlock.query.filter(
        or_(UserBlock.blocker_id == user_id, UserBlock.blocked_id == user_id)
    ).all()
    ids = set()
    for row in rows:
        ids.add(row.blocked_id if row.blocker_id == user_id else row.blocker_id)
    return ids


def is_blocked_between(user_id: int, other_id: int) -> bool:
    from app.models import UserBlock

    return (
        UserBlock.query.filter(
            or_(
                (UserBlock.blocker_id == user_id) & (UserBlock.blocked_id == other_id),
                (UserBlock.blocker_id == other_id) & (UserBlock.blocked_id == user_id),
            )
        ).first()
        is not None
    )


def ensure_safety_tables(db) -> None:
    """Create the safety tables if they are missing (idempotent).

    Production schema is not guaranteed to be migrated on deploy, so this makes
    the new tables appear without a manual `flask db upgrade`.
    """
    from app.models import ContentReport, UserBlock

    for model in (UserBlock, ContentReport):
        model.__table__.create(bind=db.engine, checkfirst=True)
