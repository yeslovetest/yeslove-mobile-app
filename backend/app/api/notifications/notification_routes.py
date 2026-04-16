from flask import request
from flask_restx import Namespace, Resource, fields
from app.utils import require_auth
from app.logging_setup import setup_logger

logger = setup_logger()

api = Namespace("notifications", description="Notification Settings")

NotificationPreferences = api.model("NotificationPreferences", {
    "posts": fields.Boolean(description="Notifications for new posts"),
    "likes": fields.Boolean(description="Notifications for likes"),
    "comments": fields.Boolean(description="Notifications for comments"),
    "events": fields.Boolean(description="Notifications for new events"),
    "blogs": fields.Boolean(description="Notifications for new blogs"),
})

@api.route("/preferences")
class NotificationPreferencesResource(Resource):
    @require_auth()
    def get(self):
        """Get user's notification preferences"""
        from app.models import User, NotificationSettings, db
        
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404
        
        settings = NotificationSettings.query.filter_by(user_id=user.id).first()
        if not settings:
            return {
                "posts": True, "likes": True, "comments": True,
                "events": True, "blogs": True
            }, 200
        
        return {
            "posts": settings.posts_enabled,
            "likes": settings.likes_enabled, 
            "comments": settings.comments_enabled,
            "events": settings.events_enabled,
            "blogs": settings.blogs_enabled
        }, 200
    
    @require_auth()
    @api.expect(NotificationPreferences)
    def put(self):
        """Update user's notification preferences"""
        from app.models import User, NotificationSettings, db
        
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404
        
        data = request.json
        settings = NotificationSettings.query.filter_by(user_id=user.id).first()
        
        if not settings:
            settings = NotificationSettings(user_id=user.id)
            db.session.add(settings)
        
        settings.posts_enabled = data.get("posts", True)
        settings.likes_enabled = data.get("likes", True)
        settings.comments_enabled = data.get("comments", True)
        settings.events_enabled = data.get("events", True)
        settings.blogs_enabled = data.get("blogs", True)
        
        db.session.commit()
        return {"message": "Preferences updated"}, 200
    
@api.route("/notifications")
class NotificationList(Resource):
    from .notification_models import NotificationListResponse
    @require_auth()
    @api.doc(security='Bearer')
    @api.param("page", "Page number (default 1)", type="integer")
    @api.param("per_page", "Notifications per page (default 20)", type="integer")
    @api.response(code=200, description="success", model=NotificationListResponse)
    def get(self):
        """Return notifications for the logged-in user."""
        from app.models import Notification, User 
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        # Pagination parameters
        try:
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 20))
        except ValueError:
            page = 1
            per_page = 20

        if page < 1:
            page = 1
        if per_page < 1:
            per_page = 20

        # Fetch and filter first so totals/unread match what the app actually renders.
        # Friend requests are displayed in a dedicated tab and should not affect the "All" unread count.
        all_notifications = (
            Notification.query
            .filter_by(user_id=user.id)
            .order_by(Notification.created_at.desc())
            .all()
        )

        filtered_notifications = [
            n for n in all_notifications
            if ((n.get_data() or {}).get("type") != "friend_request")
        ]

        total_notifications = len(filtered_notifications)
        unread_notifications = sum(1 for n in filtered_notifications if not n.is_read)

        start_index = (page - 1) * per_page
        end_index = start_index + per_page
        notifications = filtered_notifications[start_index:end_index]

        # Serialize notifications
        data = [{
            "id": n.id,
            "title": n.title,
            "body": n.body,
            "data": n.get_data(),  # optionally deserialize JSON if needed
            "type": n.notification_type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
        } for n in notifications]

        logger.info('list of notifications succesfully retrieved')

        return {
            "total": total_notifications,
            "per_page": per_page,
            "current_page": page,
            "notifications": data,
            "unread": unread_notifications
        }, 200
    
@api.route("/notifications/<int:id>/read")
class MarkNotificationRead(Resource):
    from .notification_models import MarkNotificationReadRequest
    @require_auth()
    @api.doc(security='Bearer')
    @api.expect(code=200, description="success", model=MarkNotificationReadRequest)
    def post(self, id):
        """Mark a notification as read"""
        from app.models import Notification, db
        notification = Notification.query.get_or_404(id)
        notification.is_read = True
        db.session.commit()
        logger.info('notification marked as read')
        return {"message": "Notification marked as read"}, 200

