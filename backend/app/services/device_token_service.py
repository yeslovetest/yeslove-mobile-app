from app.models import DeviceToken, User, db
from flask import current_app
from datetime import datetime, timedelta

class DeviceTokenService:
    @staticmethod
    def register_device_token(user_id, token, platform=None, device_id=None):
        """Register or update device token for user with device tracking"""
        if not token:
            return False
        
        # Remove old tokens for this device if device_id provided
        if device_id:
            old_tokens = DeviceToken.query.filter_by(user_id=user_id, device_id=device_id).all()
            for old_token in old_tokens:
                if old_token.token != token:
                    db.session.delete(old_token)
        
        # Check if token already exists
        existing_token = DeviceToken.query.filter_by(token=token).first()
        
        if existing_token:
            existing_token.user_id = user_id
            existing_token.platform = platform
            existing_token.device_id = device_id
            existing_token.last_used = datetime.utcnow()
        else:
            new_token = DeviceToken(
                user_id=user_id,
                token=token,
                platform=platform,
                device_id=device_id
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
        """Remove device token"""
        device_token = DeviceToken.query.filter_by(token=token).first()
        if device_token:
            db.session.delete(device_token)
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def cleanup_stale_tokens(days=30):
        """Remove tokens not used in specified days"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        stale_tokens = DeviceToken.query.filter(
            DeviceToken.last_used < cutoff_date
        ).all()
        
        for token in stale_tokens:
            db.session.delete(token)
        
        db.session.commit()
        return len(stale_tokens)
    
    @staticmethod
    def update_token_usage(token):
        """Update last_used timestamp for token"""
        device_token = DeviceToken.query.filter_by(token=token).first()
        if device_token:
            device_token.last_used = datetime.utcnow()
            db.session.commit()
            return True
        return False