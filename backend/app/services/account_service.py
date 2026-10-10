"""Erasure and export of a member's personal data (UK GDPR rights of erasure and access)."""
import re
from datetime import datetime
from urllib.parse import unquote, urlparse

import requests
from flask import current_app

from app.logging_setup import setup_logger

logger = setup_logger()

REMOVED_TEXT = "[removed when the account was deleted]"


class AccountErasureBlocked(Exception):
    """The account owns content other people rely on, so it cannot be erased automatically."""


_KEY_PATTERN = re.compile(r"(?:^|/)(media/[0-9a-fA-F-]{36}/.+)$")


def object_key_from_url(url):
    """Object storage key (media/<uuid>/<file>) from a stored public URL, or None."""
    if not url:
        return None
    match = _KEY_PATTERN.search(unquote(urlparse(url).path.lstrip("/")))
    return match.group(1) if match else None


def delete_keycloak_user(keycloak_id, fallback_token=None):
    """Delete the sign-in account. Returns (ok, status_code)."""
    base = current_app.config["KEYCLOAK_SERVER_URL"]
    realm = current_app.config["KEYCLOAK_REALM_NAME"]
    token = fallback_token

    admin_user = current_app.config.get("KEYCLOAK_ADMIN_USER")
    admin_pass = current_app.config.get("KEYCLOAK_ADMIN_PASS")
    if admin_user and admin_pass:
        response = requests.post(
            f"{base}/realms/master/protocol/openid-connect/token",
            data={
                "grant_type": "password",
                "client_id": "admin-cli",
                "username": admin_user,
                "password": admin_pass,
            },
            timeout=10,
        )
        if response.status_code == 200:
            token = response.json().get("access_token")
        else:
            logger.error("Keycloak admin token fetch failed during account deletion (%s)", response.status_code)

    if not token:
        return False, 500

    response = requests.delete(
        f"{base}/admin/realms/{realm}/users/{keycloak_id}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    # 404 means the sign-in account is already gone, which is the outcome we want.
    return response.status_code in (204, 404), response.status_code


class AccountService:
    # ------------------------------------------------------------------ erasure
    @staticmethod
    def check_erasable(user):
        """Raise AccountErasureBlocked if the account authored published blogs or videos."""
        from app.models import BlogPost, VideoPodcast

        if (
            BlogPost.query.filter_by(author_id=user.id).first()
            or VideoPodcast.query.filter_by(author_id=user.id).first()
        ):
            raise AccountErasureBlocked(
                "This account is the author of published articles or videos, so it has to be "
                "closed by the YesLove team. Please contact support."
            )

    @staticmethod
    def erase_user_data(user):
        """Delete everything the app holds about the user, in one transaction.

        Returns a dict of row counts and the object storage keys to remove once the
        transaction has committed. Direct messages are removed for both people in the
        conversation, because a message row cannot outlive either of its two users.
        """
        from app.models import (
            BlogView, Chat, Comment, ContentReport, DeviceToken, EmailNotificationSettings,
            Event, Follow, Like, Media, ModerationLog, Notification, NotificationSettings,
            Post, PostMedia, ProfileVisibilitySettings, Reaction, User, UserBlock, db,
            event_attendees,
        )

        AccountService.check_erasable(user)
        uid, kid = user.id, user.keycloak_id
        counts = {}

        def delete(label, query):
            counts[label] = query.delete(synchronize_session=False)

        post_ids = [p.id for p in Post.query.filter_by(user_id=uid).with_entities(Post.id)]
        media_rows = Media.query.filter_by(user_id=uid).all()
        object_keys = [k for k in (object_key_from_url(m.s3_url) for m in media_rows) if k]

        # Reactions, likes and comments, on the user's own posts and on other people's.
        if post_ids:
            delete("reactions_on_own_posts", Reaction.query.filter(Reaction.post_id.in_(post_ids)))
            delete("likes_on_own_posts", Like.query.filter(Like.post_id.in_(post_ids)))
            delete("comments_on_own_posts", Comment.query.filter(Comment.post_id.in_(post_ids)))
            delete("post_media", PostMedia.query.filter(PostMedia.post_id.in_(post_ids)))
        delete("reactions", Reaction.query.filter_by(user_id=uid))
        delete("likes", Like.query.filter_by(user_id=uid))
        delete("comments", Comment.query.filter_by(user_id=uid))

        # A deleted account must not stay linked to a website professional.
        from app.models import WordPressProfessional
        WordPressProfessional.query.filter_by(user_id=uid).update({"user_id": None}, synchronize_session=False)

        # Direct messages go before media because messages reference attachments.
        delete("messages", Chat.query.filter((Chat.sender_id == uid) | (Chat.receiver_id == uid)))
        delete("follows", Follow.query.filter((Follow.follower_id == uid) | (Follow.followed_id == uid)))

        # Media may still be linked from posts; detach, then remove the posts and the files.
        if post_ids:
            Media.query.filter(Media.post_id.in_(post_ids)).update({Media.post_id: None}, synchronize_session=False)
        delete("posts", Post.query.filter_by(user_id=uid))
        delete("media", Media.query.filter_by(user_id=uid))

        # Events the user created, with their attendee links.
        for event in Event.query.filter_by(creator_id=uid).all():
            event.attendees.clear()
            db.session.delete(event)
        db.session.execute(event_attendees.delete().where(event_attendees.c.user_id == uid))

        delete("notifications", Notification.query.filter_by(user_id=uid))
        delete("notification_settings", NotificationSettings.query.filter_by(user_id=uid))
        delete("device_tokens", DeviceToken.query.filter_by(user_id=uid))
        delete("blog_views", BlogView.query.filter_by(user_id=uid))
        delete("email_settings", EmailNotificationSettings.query.filter_by(user_id=kid))
        delete("visibility_settings", ProfileVisibilitySettings.query.filter_by(user_id=kid))
        delete("blocks", UserBlock.query.filter((UserBlock.blocker_id == uid) | (UserBlock.blocked_id == uid)))
        delete("reports_made", ContentReport.query.filter_by(reporter_id=uid))
        # Reports about this user keep their reason but lose the link to the person.
        ContentReport.query.filter_by(reported_user_id=uid).update({ContentReport.reported_user_id: None}, synchronize_session=False)

        # Moderation records are kept as anonymous statistics: the text and the link are removed.
        counts["moderation_records_anonymised"] = ModerationLog.query.filter_by(user_id=uid).update(
            {ModerationLog.user_id: None, ModerationLog.content: REMOVED_TEXT, ModerationLog.attributes: None},
            synchronize_session=False,
        )

        # Professional details cascade with the user; remove the user last.
        db.session.expire_all()
        db.session.delete(User.query.get(uid))
        db.session.commit()
        counts["user"] = 1
        return counts, object_keys

    @staticmethod
    def remove_external_copies(user_keycloak_id, object_keys):
        """Best-effort removal of copies outside the main database. Failures are logged."""
        if object_keys:
            try:
                from app.services.media.media_processor import ObjectStorage

                storage = ObjectStorage()
                for key in object_keys:
                    if not storage.delete_file(key):
                        logger.warning("Could not delete object %s during account erasure", key)
            except Exception:
                logger.exception("Object storage clean-up failed during account erasure")

        repository = getattr(current_app, "graph_repository", None)
        if repository is not None:
            try:
                repository.delete_user(user_keycloak_id)
            except Exception:
                logger.exception("Graph clean-up failed during account erasure")

    # ------------------------------------------------------------------- export
    @staticmethod
    def export_user_data(user):
        """Everything the app holds about the user, as plain JSON-ready data."""
        from app.models import (
            BlogView, Chat, Comment, ContentReport, DeviceToken, Follow, Like, Media,
            ModerationLog, Notification, NotificationSettings, Post, Reaction, User,
            UserBlock,
        )

        def iso(value):
            return value.isoformat() if isinstance(value, datetime) else (value.isoformat() if value else None)

        names = {}

        def username(user_id):
            if user_id not in names:
                other = User.query.get(user_id)
                names[user_id] = other.username if other else None
            return names[user_id]

        uid = user.id
        professional = getattr(user, "professional_details", None)
        settings = NotificationSettings.query.filter_by(user_id=uid).first()

        return {
            "exported_at": datetime.utcnow().isoformat() + "Z",
            "about": (
                "A copy of the personal data YesLove holds about this account. "
                "Messages include both sides of each conversation."
            ),
            "account": {
                "username": user.username,
                "email": user.email,
                "birthday": iso(user.birthday),
                "bio": user.bio,
                "website": user.website,
                "profile_picture_url": user.profile_pic_url,
                "account_type": user.user_type,
                "created_at": iso(user.created_at),
                "warnings": user.warnings,
                "suspended": bool(user.is_suspended),
            },
            "professional_details": None if not professional else {
                "specialization": professional.specialization,
                "licence_body": professional.license_body,
                "licence_number": professional.license_number,
                "verified": professional.is_verified,
                "verified_at": iso(professional.verified_at),
                "licence_expiry_date": iso(professional.license_expiry_date),
            },
            "posts": [
                {
                    "id": p.id, "content": p.content, "posted_at": iso(p.timestamp),
                    "anonymous": bool(p.is_anonymous), "status": p.status,
                    "image_url": p.image_url, "video_url": p.video_url,
                }
                for p in Post.query.filter_by(user_id=uid).order_by(Post.timestamp)
            ],
            "comments": [
                {"id": c.id, "post_id": c.post_id, "content": c.content, "posted_at": iso(c.timestamp)}
                for c in Comment.query.filter_by(user_id=uid).order_by(Comment.timestamp)
            ],
            "likes": [{"post_id": l.post_id} for l in Like.query.filter_by(user_id=uid)],
            "reactions": [
                {"post_id": r.post_id, "reaction": r.reaction_type} for r in Reaction.query.filter_by(user_id=uid)
            ],
            "following": [
                {"username": username(f.followed_id), "type": f.follow_type}
                for f in Follow.query.filter_by(follower_id=uid)
            ],
            "followers": [
                {"username": username(f.follower_id), "type": f.follow_type}
                for f in Follow.query.filter_by(followed_id=uid)
            ],
            "messages": [
                {
                    "id": m.id,
                    "direction": "sent" if m.sender_id == uid else "received",
                    "with": username(m.receiver_id if m.sender_id == uid else m.sender_id),
                    "message": m.message,
                    "attachment_id": m.media_id,
                    "sent_at": iso(m.timestamp),
                }
                for m in Chat.query.filter((Chat.sender_id == uid) | (Chat.receiver_id == uid)).order_by(Chat.timestamp)
            ],
            "uploaded_files": [
                {
                    "id": m.id, "filename": m.filename, "type": m.content_type,
                    "size_bytes": m.file_size, "uploaded_at": iso(m.created_at),
                    "url": m.s3_url or f"/api/media/{m.id}",
                }
                for m in Media.query.filter_by(user_id=uid)
            ],
            "blocked_users": [
                {"username": username(b.blocked_id), "blocked_at": iso(b.created_at)}
                for b in UserBlock.query.filter_by(blocker_id=uid)
            ],
            "reports_you_made": [
                {"content_type": r.content_type, "reason": r.reason, "details": r.details, "reported_at": iso(r.created_at), "status": r.status}
                for r in ContentReport.query.filter_by(reporter_id=uid)
            ],
            "notifications": [
                {"title": n.title, "body": n.body, "type": n.notification_type, "read": n.is_read, "at": iso(n.created_at)}
                for n in Notification.query.filter_by(user_id=uid).order_by(Notification.created_at)
            ],
            "notification_preferences": None if not settings else {
                "posts": settings.posts_enabled, "likes": settings.likes_enabled,
                "comments": settings.comments_enabled, "follows": settings.follows_enabled,
                "events": settings.events_enabled, "blogs": settings.blogs_enabled,
            },
            "registered_devices": [
                {"platform": d.platform, "registered_at": iso(d.created_at), "last_used": iso(d.last_used)}
                for d in DeviceToken.query.filter_by(user_id=uid)
            ],
            "articles_read": [
                {"blog_id": v.blog_id, "viewed_at": iso(v.viewed_at), "seconds": v.read_duration}
                for v in BlogView.query.filter_by(user_id=uid)
            ],
            "moderation_records": [
                {"content_type": m.content_type, "content": m.content, "severity": m.severity,
                 "action": m.auto_action, "at": iso(m.timestamp)}
                for m in ModerationLog.query.filter_by(user_id=uid)
            ],
        }
