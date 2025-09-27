from flask import request
from flask_restx import Namespace, Resource, fields
from app.utils import require_auth
from app.models import db

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
        from app.models import User, NotificationSettings
        
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
        from app.models import User, NotificationSettings
        
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