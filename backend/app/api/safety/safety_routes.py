from flask import request
from flask_restx import Namespace, Resource, fields
from sqlalchemy.exc import IntegrityError

from app.logging_setup import setup_logger
from app.utils import require_auth
from app.utils.common_helpers import get_current_user
from app.utils.safety import blocked_user_ids

logger = setup_logger()

api = Namespace("safety", description="Report content and block users")

REPORT_REASONS = {
    "harassment",
    "hate",
    "sexual",
    "violence",
    "self_harm",
    "spam",
    "impersonation",
    "other",
}
REPORTABLE_TYPES = {"post", "comment", "message", "user"}

ReportRequest = api.model("ReportRequest", {
    "content_type": fields.String(required=True, description="post, comment, message or user"),
    "content_id": fields.Integer(required=False, description="Id of the post, comment or message; user id for a user report"),
    "user_keycloak_id": fields.String(required=False, description="For user reports: Keycloak id instead of content_id"),
    "reason": fields.String(required=True, description="One of: " + ", ".join(sorted(REPORT_REASONS))),
    "details": fields.String(required=False, description="Optional extra context (max 500 chars)"),
})


def _resolve_reported_user(content_type: str, content_id: int, reporter):
    """Return (reported_user_id, error_response) for the reported content.

    Users can only report content they could legitimately see, and never their own.
    """
    from app.models import Chat, Comment, Post, User

    if content_type == "post":
        item = Post.query.get(content_id)
        owner_id = item.user_id if item else None
    elif content_type == "comment":
        item = Comment.query.get(content_id)
        owner_id = item.user_id if item else None
    elif content_type == "message":
        item = Chat.query.get(content_id)
        # Only the recipient of a message can report it.
        if item and item.receiver_id != reporter.id:
            return None, ({"message": "You can only report messages sent to you"}, 403)
        owner_id = item.sender_id if item else None
    else:
        item = User.query.get(content_id)
        owner_id = item.id if item else None

    if item is None:
        return None, ({"message": "Content not found"}, 404)
    if owner_id == reporter.id:
        return None, ({"message": "You cannot report your own content"}, 400)
    return owner_id, None


@api.route("/report")
class ReportContent(Resource):
    @require_auth()
    @api.expect(ReportRequest)
    @api.response(201, "Report received")
    @api.response(200, "Already reported")
    def post(self):
        """Report a post, comment, message or user for review by the moderation team."""
        from app.models import ContentReport, db

        user, error, status = get_current_user()
        if error:
            return error, status

        data = request.get_json(silent=True) or {}
        content_type = data.get("content_type")
        content_id = data.get("content_id")
        # User reports may identify the user by Keycloak id, which is what the app holds.
        if content_type == "user" and data.get("user_keycloak_id"):
            from app.models import User
            reported = User.query.filter_by(keycloak_id=data["user_keycloak_id"]).first()
            if not reported:
                return {"message": "Content not found"}, 404
            content_id = reported.id
        reason = data.get("reason")
        details = (data.get("details") or "").strip()[:500] or None

        if content_type not in REPORTABLE_TYPES:
            return {"message": "content_type must be one of: " + ", ".join(sorted(REPORTABLE_TYPES))}, 400
        if not isinstance(content_id, int) or isinstance(content_id, bool):
            return {"message": "content_id must be an integer"}, 400
        if reason not in REPORT_REASONS:
            return {"message": "reason must be one of: " + ", ".join(sorted(REPORT_REASONS))}, 400

        reported_user_id, error_response = _resolve_reported_user(content_type, content_id, user)
        if error_response:
            return error_response

        existing = ContentReport.query.filter_by(
            reporter_id=user.id, content_type=content_type, content_id=content_id
        ).first()
        if existing:
            return {"message": "You have already reported this", "report_id": existing.id}, 200

        report = ContentReport(
            reporter_id=user.id,
            reported_user_id=reported_user_id,
            content_type=content_type,
            content_id=content_id,
            reason=reason,
            details=details,
        )
        db.session.add(report)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"message": "You have already reported this"}, 200

        logger.info(
            "Content report %s: %s %s reported by user %s (%s)",
            report.id, content_type, content_id, user.id, reason,
        )
        return {"message": "Thanks, we'll review this.", "report_id": report.id}, 201


@api.route("/blocks")
class ListBlocks(Resource):
    @require_auth()
    def get(self):
        """List users the current user has blocked."""
        from app.models import User, UserBlock

        user, error, status = get_current_user()
        if error:
            return error, status

        rows = (
            UserBlock.query.filter_by(blocker_id=user.id)
            .order_by(UserBlock.created_at.desc())
            .all()
        )
        users = {u.id: u for u in User.query.filter(User.id.in_([r.blocked_id for r in rows])).all()} if rows else {}
        return {
            "blocked": [
                {
                    "id": users[r.blocked_id].keycloak_id,
                    "username": users[r.blocked_id].username,
                    "profile_pic": users[r.blocked_id].profile_pic_url,
                    "blocked_at": r.created_at.isoformat() if r.created_at else None,
                }
                for r in rows
                if r.blocked_id in users
            ]
        }, 200


@api.route("/block/<string:keycloak_id>")
class BlockUser(Resource):
    @require_auth()
    @api.response(201, "User blocked")
    def post(self, keycloak_id):
        """Block a user: hides their posts, comments and messages and removes any follow links."""
        from app.models import Follow, User, UserBlock, db

        user, error, status = get_current_user()
        if error:
            return error, status

        target = User.query.filter_by(keycloak_id=keycloak_id).first()
        if not target:
            return {"message": "User not found"}, 404
        if target.id == user.id:
            return {"message": "You cannot block yourself"}, 400

        if UserBlock.query.filter_by(blocker_id=user.id, blocked_id=target.id).first():
            return {"message": "User already blocked"}, 200

        db.session.add(UserBlock(blocker_id=user.id, blocked_id=target.id))
        # Blocking ends any follow or friend relationship in both directions.
        Follow.query.filter(
            ((Follow.follower_id == user.id) & (Follow.followed_id == target.id))
            | ((Follow.follower_id == target.id) & (Follow.followed_id == user.id))
        ).delete(synchronize_session=False)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"message": "User already blocked"}, 200

        return {"message": f"You blocked {target.username}"}, 201

    @require_auth()
    def delete(self, keycloak_id):
        """Unblock a user."""
        from app.models import User, UserBlock, db

        user, error, status = get_current_user()
        if error:
            return error, status

        target = User.query.filter_by(keycloak_id=keycloak_id).first()
        if not target:
            return {"message": "User not found"}, 404

        UserBlock.query.filter_by(blocker_id=user.id, blocked_id=target.id).delete()
        db.session.commit()
        return {"message": f"You unblocked {target.username}"}, 200
