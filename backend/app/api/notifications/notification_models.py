from .notification_routes import api
from flask_restx import fields

# Model for creating notifications 
CreateNotificationRequest = api.model("CreateNotificationRequest", {
    "user_id": fields.String(required=True, description="Keycloak ID of the user to notify"),
    "title": fields.String(required=True, description="Notification title"),
    "body": fields.String(required=True, description="Notification message content"),
    "type": fields.String(required=True, description="Type of notification, e.g., 'like', 'comment', 'blog'"),
    "data": fields.Raw(description="Extra JSON data, e.g., post_id, blog_id, user_profile_pic_url"),
})

# Model for marking a notification as read
MarkNotificationReadRequest = api.model("MarkNotificationReadRequest", {
    "notification_id": fields.Integer(required=True, description="ID of the notification to mark as read")
})

# Model for returning a single notification
Notification = api.model("Notification", {
    "id": fields.Integer(description="Notification ID"),
    "title": fields.String(description="Notification title"),
    "body": fields.String(description="Notification content"),
    "type": fields.String(description="Type of notification"),
    "data": fields.Raw(description="Extra data payload"),
    "is_read": fields.Boolean(description="Whether the notification has been read"),
    "created_at": fields.String(description="Timestamp in ISO format")
})

# Model for paginated notification response
NotificationListResponse = api.model("NotificationListResponse", {
    "total": fields.Integer(description="Total number of notifications for the user"),
    "per_page": fields.Integer(description="Number of notifications per page"),
    "current_page": fields.Integer(description="Current page number"),
    "notifications": fields.List(fields.Nested(Notification), description="List of notifications"),
    "unread": fields.Integer(description="Number of unread notifications")
})
