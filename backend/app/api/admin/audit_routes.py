from datetime import datetime

from flask import request
from flask_restx import Namespace, Resource

from app.utils import require_auth
from app.utils.audit import audited

api = Namespace("admin/audit", description="Audit trail of access to personal data")


def _is_admin() -> bool:
    return "admin" in request.user.get("realm_access", {}).get("roles", [])


@api.route("/events")
class AuditEvents(Resource):
    @require_auth()
    @audited("admin.audit.view")  # reading the trail is itself recorded
    @api.doc(description="List audit events, newest first (admin only)", security="Bearer")
    @api.param("action", "Action name, or a prefix such as admin.", type="string")
    @api.param("actor_user_id", "Who did it", type="integer")
    @api.param("subject_user_id", "Whose data was touched", type="integer")
    @api.param("outcome", "ok, denied or error", type="string")
    @api.param("since", "ISO date or time; only events at or after it", type="string")
    @api.param("page", "Page number", type="integer", default=1)
    @api.param("per_page", "Events per page (max 200)", type="integer", default=50)
    def get(self):
        from app.models import AuditEvent

        if not _is_admin():
            return {"message": "Admin role required"}, 403

        query = AuditEvent.query
        args = request.args
        if args.get("action"):
            query = query.filter(AuditEvent.action.like(args["action"].replace("%", "") + "%"))
        for field in ("actor_user_id", "subject_user_id"):
            if args.get(field):
                try:
                    query = query.filter(getattr(AuditEvent, field) == int(args[field]))
                except ValueError:
                    return {"message": f"{field} must be a number"}, 400
        if args.get("outcome"):
            query = query.filter(AuditEvent.outcome == args["outcome"])
        if args.get("since"):
            try:
                query = query.filter(AuditEvent.occurred_at >= datetime.fromisoformat(args["since"]))
            except ValueError:
                return {"message": "since must be an ISO date or time"}, 400

        try:
            page = max(int(args.get("page", 1)), 1)
            per_page = max(1, min(int(args.get("per_page", 50)), 200))
        except ValueError:
            return {"message": "page and per_page must be numbers"}, 400
        paginated = query.order_by(AuditEvent.occurred_at.desc(), AuditEvent.id.desc()).paginate(
            page=page, per_page=per_page, error_out=False)
        return {
            "items": [{
                "id": e.id, "occurred_at": e.occurred_at.isoformat(), "actor_user_id": e.actor_user_id,
                "actor_role": e.actor_role, "action": e.action, "subject_user_id": e.subject_user_id,
                "resource": e.resource, "outcome": e.outcome, "ip_address": e.ip_address,
            } for e in paginated.items],
            "pagination": {"page": paginated.page, "per_page": paginated.per_page, "total": paginated.total,
                           "pages": paginated.pages, "has_next": paginated.has_next},
        }, 200
