import requests
from app.logging_setup import logger

FCM_SERVER_KEY = "YOUR_FCM_SERVER_KEY"
FCM_URL = "https://fcm.googleapis.com/fcm/send"

def send_push_notification_to_all_users(title, message, data=None):
    from app.models import DeviceToken
    tokens = [dt.token for dt in DeviceToken.query.all()]
    if not tokens:
        logger.info("No device tokens found for push notification.")
        return

    headers = {
        "Authorization": f"key={FCM_SERVER_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "registration_ids": tokens,
        "notification": {
            "title": title,
            "body": message
        },
        "data": data or {}
    }
    try:
        response = requests.post(FCM_URL, json=payload, headers=headers)
        response.raise_for_status()
        logger.info(f"Push notification sent to {len(tokens)} devices.")
    except Exception as e:
        logger.error(f"Failed to send push notification: {e}")

def send_push_notification_to_users(user_ids, title, message, data=None):
    from app.models import DeviceToken
    tokens = [
        dt.token for dt in DeviceToken.query.filter(DeviceToken.user_id.in_(user_ids)).all()
    ]
    if not tokens:
        logger.info("No device tokens found for push notification.")
        return

    headers = {
        "Authorization": f"key={FCM_SERVER_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "registration_ids": tokens,
        "notification": {
            "title": title,
            "body": message
        },
        "data": data or {}
    }
    try:
        response = requests.post(FCM_URL, json=payload, headers=headers)
        response.raise_for_status()
        logger.info(f"Push notification sent to {len(tokens)} devices.")
    except Exception as e:
        logger.error(f"Failed to send push notification: {e}")