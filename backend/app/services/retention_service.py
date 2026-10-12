"""Scheduled deletion and anonymisation, implementing the published retention schedule.

Each rule is idempotent and bounded, so the job can run daily and can be re-run safely.
Run with `flask run-retention` (add --dry-run to count without changing anything).
"""
from datetime import datetime, timedelta

from app.logging_setup import setup_logger

logger = setup_logger()

# Retention periods in days. Keep in step with the retention schedule in the privacy notice.
POLICY = {
    "device_tokens_unused": 30,        # push tokens not used for 30 days
    "notifications": 365,              # in-app notifications
    "blog_views": 730,                 # which articles a member read
    "moderation_records": 365,         # flagged text is anonymised after 12 months
    "closed_reports": 730,             # resolved or dismissed reports
    "audit_events": 365,               # the audit trail of access to personal data
    "friend_requests_answered": 90,    # accepted, declined or withdrawn friend requests
    "removed_posts": 90,               # posts an admin removed, kept briefly as evidence
}

REMOVED_TEXT = "[removed under the retention schedule]"


def _cutoff(days, now):
    return now - timedelta(days=days)


def run_retention(now=None, dry_run=False):
    """Apply every rule. Returns {rule: rows affected}."""
    from app.models import (
        AuditEvent, BlogView, ContentReport, DeviceToken, FriendRequest, Media, ModerationLog, Notification, Post, db,
    )

    now = now or datetime.utcnow()
    result = {}

    def count_or_apply(label, query, apply):
        n = query.count()
        result[label] = n
        if n and not dry_run:
            apply(query)

    count_or_apply(
        "device_tokens_unused",
        DeviceToken.query.filter(DeviceToken.last_used < _cutoff(POLICY["device_tokens_unused"], now)),
        lambda q: q.delete(synchronize_session=False),
    )
    count_or_apply(
        "notifications",
        Notification.query.filter(Notification.created_at < _cutoff(POLICY["notifications"], now)),
        lambda q: q.delete(synchronize_session=False),
    )
    count_or_apply(
        "audit_events",
        AuditEvent.query.filter(AuditEvent.occurred_at < _cutoff(POLICY["audit_events"], now)),
        lambda q: q.delete(synchronize_session=False),
    )
    count_or_apply(
        "friend_requests_answered",
        FriendRequest.query.filter(
            FriendRequest.status != "pending",
            FriendRequest.responded_at < _cutoff(POLICY["friend_requests_answered"], now),
        ),
        lambda q: q.delete(synchronize_session=False),
    )
    count_or_apply(
        "blog_views",
        BlogView.query.filter(BlogView.viewed_at < _cutoff(POLICY["blog_views"], now)),
        lambda q: q.delete(synchronize_session=False),
    )
    count_or_apply(
        "closed_reports",
        ContentReport.query.filter(
            ContentReport.status != "open",
            ContentReport.created_at < _cutoff(POLICY["closed_reports"], now),
        ),
        lambda q: q.delete(synchronize_session=False),
    )

    # Moderation records keep their scores for statistics; the person and the text go.
    stale_moderation = ModerationLog.query.filter(
        ModerationLog.timestamp < _cutoff(POLICY["moderation_records"], now),
        (ModerationLog.user_id.isnot(None)) | (ModerationLog.content != REMOVED_TEXT),
    )
    count_or_apply(
        "moderation_records",
        stale_moderation,
        lambda q: q.update(
            {ModerationLog.user_id: None, ModerationLog.content: REMOVED_TEXT, ModerationLog.attributes: None},
            synchronize_session=False,
        ),
    )

    # Posts removed by an admin: delete them, their comments and their files.
    removed = Post.query.filter(
        Post.status == "removed",
        Post.timestamp < _cutoff(POLICY["removed_posts"], now),
    )
    result["removed_posts"] = removed.count()
    if result["removed_posts"] and not dry_run:
        object_keys = []
        for post in removed.all():
            for media in Media.query.filter_by(post_id=post.id).all():
                object_keys.append(media.s3_url)
            db.session.delete(post)  # cascades to comments, likes and post media
        db.session.flush()
        for url in object_keys:
            _delete_stored_file(url)

    if not dry_run:
        db.session.commit()
    logger.info("Retention run (%s): %s", "dry run" if dry_run else "applied", result)
    return result


def _delete_stored_file(url):
    """Best-effort removal of an uploaded file from object storage."""
    from app.services.account_service import object_key_from_url

    key = object_key_from_url(url)
    if not key:
        return
    try:
        from app.services.media.media_processor import ObjectStorage

        if not ObjectStorage().delete_file(key):
            logger.warning("Could not delete stored file %s during retention run", key)
    except Exception:
        logger.exception("Object storage clean-up failed during retention run")


def privatise_chat_media(dry_run=False):
    """One-off: mark attachments that were sent in direct messages as private.

    Files uploaded before chat attachments became private were saved as public. After
    this runs they are served only through the API to the sender and receiver. A file
    already stored in object storage under a public address keeps working at that
    address until the object itself is made private in the storage console.
    """
    from app.models import Chat, Media, db

    attached = db.session.query(Chat.media_id).filter(Chat.media_id.isnot(None))
    query = Media.query.filter(Media.is_public.is_(True), Media.id.in_(attached))
    count = query.count()
    if count and not dry_run:
        query.update({Media.is_public: False}, synchronize_session=False)
        db.session.commit()
    return count
