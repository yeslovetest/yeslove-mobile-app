import requests
import json
from app.models import DeviceToken, User
from flask import current_app
import os

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


class PushNotificationService:
    
    @staticmethod
    def send_to_user(user_id, title, body, data=None, notification_type="posts"):
        """Send push notification to user if they have notifications enabled"""
        from app.models import NotificationSettings, Notification, db
        
        # Check if user has this notification type enabled
        settings = NotificationSettings.query.filter_by(user_id=user_id).first()

        # save new notification to database
        notification = Notification(
            user_id=user_id,
            title=title,
            body=body,
            data=data,
            notification_type=notification_type
        )
        db.session.add(notification)
        db.session.commit()

        if settings:
            enabled = getattr(settings, f"{notification_type}_enabled", True)
            if not enabled:
                return False
        
        tokens = DeviceToken.query.filter_by(user_id=user_id).all()
        if not tokens:
            return False
        
        success_count = 0
        for token in tokens:
            if PushNotificationService._send_to_token(token.token, title, body, data):
                success_count += 1
        
        return success_count > 0

    @staticmethod
    def _is_expo_token(token):
        return isinstance(token, str) and token.startswith(("ExponentPushToken[", "ExpoPushToken["))

    @staticmethod
    def _send_to_token(token, title, body, data=None):
        """Route to Expo's push service for Expo tokens (what the mobile app registers)
        and to FCM directly for raw device tokens."""
        if PushNotificationService._is_expo_token(token):
            return PushNotificationService._send_expo_notification(token, title, body, data)
        return PushNotificationService._send_fcm_notification(token, title, body, data)

    @staticmethod
    def _send_expo_notification(token, title, body, data=None):
        """Send through Expo's push service, which delivers via APNs (iOS) and FCM (Android)
        using the credentials uploaded to EAS."""
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        access_token = os.getenv("EXPO_ACCESS_TOKEN")
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"

        payload = {
            "to": token,
            "title": title,
            "body": body,
            "sound": "default",
            "priority": "high",
            "channelId": "default",
        }
        if data:
            payload["data"] = data

        try:
            response = requests.post(EXPO_PUSH_URL, headers=headers, json=payload, timeout=10)
            if response.status_code != 200:
                current_app.logger.error(f"Expo push HTTP {response.status_code}")
                return False
            ticket = (response.json() or {}).get("data") or {}
            if isinstance(ticket, list):
                ticket = ticket[0] if ticket else {}
            if ticket.get("status") == "ok":
                return True
            error = (ticket.get("details") or {}).get("error")
            if error == "DeviceNotRegistered":
                # The app was uninstalled or the token expired: stop sending to it.
                from app.services.device_token_service import DeviceTokenService
                DeviceTokenService.remove_device_token(token)
            current_app.logger.warning(f"Expo push rejected: {error or ticket.get('message')}")
            return False
        except Exception as e:
            current_app.logger.error(f"Expo push error: {e}")
            return False
    
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
        """Send FCM notification using V1 API"""
        import google.auth.transport.requests
        import google.oauth2.service_account

        service_account_path = os.getenv('FCM_SERVICE_ACCOUNT_PATH')
        if not service_account_path:
            current_app.logger.error("FCM_SERVICE_ACCOUNT_PATH not configured")
            return False

        try:
            credentials = google.oauth2.service_account.Credentials.from_service_account_file(
                service_account_path,
                scopes=['https://www.googleapis.com/auth/firebase.messaging']
            )
            credentials.refresh(google.auth.transport.requests.Request())
            access_token = credentials.token
            project_id = credentials.project_id
            url = f"https://fcm.googleapis.com/v1/projects/{project_id}/messages:send"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            payload = {
                "message": {
                    "token": token,
                    "notification": {
                        "title": title,
                        "body": body
                    }
                }
            }
            if data:
                payload["message"]["data"] = {k: str(v) for k, v in data.items()}
            response = requests.post(url, headers=headers, json=payload)
            return response.status_code == 200
        except Exception as e:
            current_app.logger.error(f"FCM send error: {e}")
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