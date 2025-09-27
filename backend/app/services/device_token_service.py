from app.models import DeviceToken, User, db
from flask import current_app

class DeviceTokenService:
    @staticmethod
    def register_device_token(user_id, token, platform=None):
        """Register or update device token for user"""
        if not token:
            return False
        
        # Check if token already exists
        existing_token = DeviceToken.query.filter_by(token=token).first()
        
        if existing_token:
            # Update existing token with new user
            existing_token.user_id = user_id
            existing_token.platform = platform
        else:
            # Create new token
            new_token = DeviceToken(
                user_id=user_id,
                token=token,
                platform=platform
            )
            db.session.add(new_token)
        
        try:
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Failed to register device token: {e}")
            return False
    
    @staticmethod
    def remove_device_token(token):
        """Remove device token when user logs out"""
        device_token = DeviceToken.query.filter_by(token=token).first()
        if device_token:
            db.session.delete(device_token)
            db.session.commit()
            return True
        return False