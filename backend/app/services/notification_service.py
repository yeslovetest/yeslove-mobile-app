from app.models import Notification, User, NotificationSettings, db
from app.services.push_notification_service import PushNotificationService
from flask import current_app

class NotificationService:
    
    @staticmethod
    def create_notification(user_id, title, body, notification_type, data=None, realtime=False):
        """Create and send notification"""
        try:
            # Create DB record
            notification = Notification(
                user_id=user_id,
                title=title,
                body=body,
                notification_type=notification_type,
                data=data
            )
            db.session.add(notification)
            db.session.commit()
            
            # Send push notification
            PushNotificationService.send_to_user(user_id, title, body, data, notification_type)
            
            return notification
        except Exception as e:
            current_app.logger.error(f"Failed to create notification: {e}")
            db.session.rollback()
            return None
    
    @staticmethod
    def get_user_notifications(user_id, page=1, per_page=20):
        """Get paginated notifications for user"""
        return Notification.query.filter_by(user_id=user_id)\
            .order_by(Notification.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
    
    @staticmethod
    def mark_notification_read(notification_id):
        """Mark notification as read"""
        notification = Notification.query.get(notification_id)
        if notification:
            notification.is_read = True
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def get_unread_count(user_id):
        """Get unread notification count"""
        return Notification.query.filter_by(user_id=user_id, is_read=False).count()