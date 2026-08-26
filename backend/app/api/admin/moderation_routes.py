from flask import request
from flask_restx import Namespace, Resource
from app.utils import require_auth
from app.logging_setup import setup_logger
from app.utils.moderation_utils import apply_user_penalties
from datetime import date, datetime, timedelta

logger = setup_logger()

api = Namespace("admin/moderation", description="Admin Moderation Management")

def _is_admin() -> bool:
    roles = request.user.get("realm_access", {}).get("roles", [])
    return "admin" in roles

def _serialize_professional(details):
    user = details.user
    registry_urls = {
        "HCPC": "https://www.hcpc-uk.org/check-the-register/",
        "BACP": "https://www.bacp.co.uk/search/Register",
        "UKCP": "https://psychotherapy.my.site.com/s/searchdirectory?id=a3VTl000001Sd97",
    }

    return {
        "id": details.id,
        "user_id": details.user_id,
        "username": user.username if user else None,
        "email": user.email if user else None,
        "specialization": details.specialization,
        "license_body": details.license_body,
        "license_number": details.license_number,
        "consent_license_data": details.consent_license_data,
        "is_verified": details.is_verified,
        "verified_at": details.verified_at.isoformat() if details.verified_at else None,
        "next_reverify_date": details.next_reverify_date.isoformat() if details.next_reverify_date else None,
        "license_expiry_date": details.license_expiry_date.isoformat() if details.license_expiry_date else None,
        "registry_url": registry_urls.get((details.license_body or "").upper()),
    }

@api.route("/logs")
class ModerationLogs(Resource):
    @require_auth()
    @api.doc(description="Get moderation logs with filtering options")
    @api.param("status", "Filter by status: flagged, blocked, reviewed", type='string')
    @api.param("severity", "Filter by severity: low, medium, high", type='string')
    @api.param("content_type", "Filter by content type: post, comment, chat", type='string')
    @api.param("page", "Page number", type='integer', default=1)
    @api.param("per_page", "Items per page", type='integer', default=20)
    def get(self):
        """Get moderation logs for admin review."""
        from app.models import ModerationLog, User

        if not _is_admin():
            return {"message": "Admin role required"}, 403
        
        query = ModerationLog.query
        
        # Apply filters
        if request.args.get("status"):
            query = query.filter(ModerationLog.auto_action == request.args.get("status"))
        
        if request.args.get("severity"):
            query = query.filter(ModerationLog.severity == request.args.get("severity"))
        
        if request.args.get("content_type"):
            query = query.filter(ModerationLog.content_type == request.args.get("content_type"))
        
        # Pagination
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 20))
        
        paginated = query.order_by(ModerationLog.timestamp.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        logs = []
        for log in paginated.items:
            user = User.query.get(log.user_id) if log.user_id else None
            logs.append({
                "id": log.id,
                "user": user.username if user else "Unknown",
                "user_id": log.user_id,
                "content_type": log.content_type,
                "content": log.content[:100] + "..." if len(log.content) > 100 else log.content,
                "score": log.score,
                "severity": log.severity,
                "auto_action": log.auto_action,
                "admin_override": log.admin_override,
                "reviewed_by": log.reviewed_by,
                "timestamp": log.timestamp.isoformat()
            })
        
        return {
            "logs": logs,
            "pagination": {
                "page": paginated.page,
                "per_page": paginated.per_page,
                "total": paginated.total,
                "pages": paginated.pages,
                "has_next": paginated.has_next,
                "has_prev": paginated.has_prev
            }
        }, 200

@api.route("/logs/<int:log_id>/review")
class ReviewModerationLog(Resource):
    @require_auth()
    @api.doc(description="Admin review of a moderation log")
    def put(self, log_id):
        """Admin review and override moderation decision."""
        from app.models import ModerationLog, User, db
        from datetime import datetime

        if not _is_admin():
            return {"message": "Admin role required"}, 403
        
        data = request.json
        action = data.get("action")  # "approved", "rejected", "escalated"
        notes = data.get("notes", "")
        
        if action not in ["approved", "rejected", "escalated"]:
            return {"message": "Invalid action"}, 400
        
        log = ModerationLog.query.get(log_id)
        if not log:
            return {"message": "Moderation log not found"}, 404
        
        # Update log with admin decision
        log.admin_override = action
        log.admin_notes = notes
        log.reviewed_by = 1  # TODO: Get actual admin user ID
        log.reviewed_at = datetime.utcnow()
        
        # Apply penalties if rejected
        if action == "rejected" and log.user_id:
            apply_user_penalties(log.user_id, log.severity)
        
        db.session.commit()
        
        return {"message": f"Moderation log {action}"}, 200

@api.route("/users/<int:user_id>/suspend")
class SuspendUser(Resource):
    @require_auth()
    @api.doc(description="Suspend or unsuspend a user")
    def put(self, user_id):
        """Suspend or unsuspend a user."""
        from app.models import User, db

        if not _is_admin():
            return {"message": "Admin role required"}, 403
        
        data = request.json
        suspend = data.get("suspend", True)
        reason = data.get("reason", "")
        
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404
        
        user.is_suspended = suspend
        db.session.commit()
        
        action = "suspended" if suspend else "unsuspended"
        logger.info(f"User {user.username} {action} by admin. Reason: {reason}")
        
        return {"message": f"User {action} successfully"}, 200

@api.route("/stats")
class ModerationStats(Resource):
    @require_auth()
    @api.doc(description="Get moderation statistics")
    def get(self):
        """Get moderation statistics for dashboard."""
        from app.models import ModerationLog, User
        from sqlalchemy import func

        if not _is_admin():
            return {"message": "Admin role required"}, 403
        
        # Get counts by severity
        severity_stats = ModerationLog.query.with_entities(
            ModerationLog.severity,
            func.count(ModerationLog.id).label('count')
        ).group_by(ModerationLog.severity).all()
        
        # Get counts by content type
        content_stats = ModerationLog.query.with_entities(
            ModerationLog.content_type,
            func.count(ModerationLog.id).label('count')
        ).group_by(ModerationLog.content_type).all()
        
        # Get suspended users count
        suspended_users = User.query.filter_by(is_suspended=True).count()
        
        # Get pending reviews
        pending_reviews = ModerationLog.query.filter(
            ModerationLog.admin_override.is_(None),
            ModerationLog.auto_action == "flagged"
        ).count()
        
        return {
            "severity_stats": {stat.severity: stat.count for stat in severity_stats},
            "content_stats": {stat.content_type: stat.count for stat in content_stats},
            "suspended_users": suspended_users,
            "pending_reviews": pending_reviews,
            "total_logs": ModerationLog.query.count()
        }, 200

@api.route("/professionals")
class ProfessionalVerificationList(Resource):
    @require_auth()
    @api.doc(description="List professional verification records")
    @api.param("status", "Filter by status: pending, verified, all", type="string", default="pending")
    @api.param("q", "Search username, email, license number, or specialization", type="string")
    @api.param("page", "Page number", type="integer", default=1)
    @api.param("per_page", "Items per page", type="integer", default=20)
    def get(self):
        from app.models import ProfessionalDetails, User

        if not _is_admin():
            return {"message": "Admin role required"}, 403

        status = request.args.get("status", "pending")
        q = request.args.get("q")
        page = max(int(request.args.get("page", 1)), 1)
        per_page = max(1, min(int(request.args.get("per_page", 20)), 100))

        query = ProfessionalDetails.query.join(User)

        if status == "pending":
            query = query.filter(ProfessionalDetails.is_verified.is_(False))
        elif status == "verified":
            query = query.filter(ProfessionalDetails.is_verified.is_(True))
        elif status != "all":
            return {"message": "Invalid status"}, 400

        if q:
            pattern = f"%{q}%"
            query = query.filter(
                (User.username.ilike(pattern)) |
                (User.email.ilike(pattern)) |
                (ProfessionalDetails.license_number.ilike(pattern)) |
                (ProfessionalDetails.specialization.ilike(pattern))
            )

        query = query.order_by(ProfessionalDetails.is_verified.asc(), User.username.asc())
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            "items": [_serialize_professional(item) for item in paginated.items],
            "pagination": {
                "page": paginated.page,
                "per_page": paginated.per_page,
                "total": paginated.total,
                "pages": paginated.pages,
                "has_next": paginated.has_next,
                "has_prev": paginated.has_prev,
            }
        }, 200

@api.route("/professionals/<int:professional_id>/verification")
class ProfessionalVerification(Resource):
    @require_auth()
    @api.doc(description="Verify or unverify a professional license")
    def put(self, professional_id):
        from app.models import ProfessionalDetails, db

        if not _is_admin():
            return {"message": "Admin role required"}, 403

        data = request.json or {}
        verified = bool(data.get("is_verified", True))
        license_expiry_date = data.get("license_expiry_date")
        next_reverify_date = data.get("next_reverify_date")

        details = ProfessionalDetails.query.get(professional_id)
        if not details:
            return {"message": "Professional details not found"}, 404

        if verified:
            details.is_verified = True
            details.verified_at = datetime.utcnow()
            details.next_reverify_date = _parse_date(next_reverify_date) if next_reverify_date else date.today() + timedelta(days=183)
        else:
            details.is_verified = False
            details.verified_at = None
            details.next_reverify_date = None

        if license_expiry_date:
            details.license_expiry_date = _parse_date(license_expiry_date)

        db.session.commit()

        action = "verified" if verified else "unverified"
        return {
            "message": f"Professional {action}",
            "professional": _serialize_professional(details),
        }, 200

def _parse_date(value):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None
