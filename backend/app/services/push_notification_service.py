import requests
import json
from app.models import DeviceToken, User
from flask import current_app
import os

class PushNotificationService:
    
    @staticmethod
    def send_to_user(user_id, title, body, data=None, notification_type="posts"):
        """Send push notification to user if they have notifications enabled"""
        from app.models import NotificationSettings
        
        # Check if user has this notification type enabled
        settings = NotificationSettings.query.filter_by(user_id=user_id).first()
        if settings:
            enabled = getattr(settings, f"{notification_type}_enabled", True)
            if not enabled:
                return False
        
        tokens = DeviceToken.query.filter_by(user_id=user_id).all()
        if not tokens:
            return False
        
        success_count = 0
        for token in tokens:
            if PushNotificationService._send_fcm_notification(token.token, title, body, data):
                success_count += 1
        
        return success_count > 0
    
    @staticmethod
    def send_to_multiple_users(user_ids, title, body, data=None, notification_type="posts"):
        """Send push notification to multiple users via SQS"""
        # For large user lists, use SQS for async processing
        if len(user_ids) > 10:
            from app.services.sqs_service import SQSService
            sqs = SQSService()
            return sqs.send_notification_job(user_ids, title, body, data)
        
        # For small lists, send directly
        success_count = 0
        for user_id in user_ids:
            if PushNotificationService.send_to_user(user_id, title, body, data, notification_type):
                success_count += 1
        return success_count
    
    @staticmethod
    def _send_fcm_notification(token, title, body, data=None):
        """Send FCM notification to specific token"""
        fcm_server_key = os.getenv('FCM_SERVER_KEY')
        if not fcm_server_key:
            current_app.logger.error("FCM_SERVER_KEY not configured")
            return False
        
        url = "https://fcm.googleapis.com/fcm/send"
        headers = {
            "Authorization": f"key={fcm_server_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "to": token,
            "notification": {
                "title": title,
                "body": body
            }
        }
        
        if data:
            payload["data"] = data
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            return response.status_code == 200
        except Exception as e:
            current_app.logger.error(f"FCM send error: {e}")
            return False