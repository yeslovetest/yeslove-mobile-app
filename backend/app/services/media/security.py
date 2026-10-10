import hashlib
import time
from flask import request, abort
from functools import wraps

class SecurityService:
    # Rate limiting storage (in production, use Redis)
    upload_attempts = {}
    
    @staticmethod
    def rate_limit_uploads(max_uploads=10, window=3600):
        """Rate limit uploads per user per hour"""
        def decorator(f):
            @wraps(f)
            def wrapper(*args, **kwargs):
                user_id = getattr(request, 'user_id', None)
                if not user_id:
                    return f(*args, **kwargs)
                
                now = time.time()
                key = f"upload_{user_id}"
                
                if key not in SecurityService.upload_attempts:
                    SecurityService.upload_attempts[key] = []
                
                # Clean old attempts
                SecurityService.upload_attempts[key] = [
                    t for t in SecurityService.upload_attempts[key] 
                    if now - t < window
                ]
                
                if len(SecurityService.upload_attempts[key]) >= max_uploads:
                    abort(429, "Upload rate limit exceeded")
                
                SecurityService.upload_attempts[key].append(now)
                return f(*args, **kwargs)
            return wrapper
        return decorator
    
    @staticmethod
    def scan_file_content(content):
        """Basic virus scanning - check for suspicious patterns"""
        suspicious_patterns = [
            b'<script', b'javascript:', b'vbscript:', 
            b'<?php', b'<%', b'eval('
        ]
        
        content_lower = content.lower()
        for pattern in suspicious_patterns:
            if pattern in content_lower:
                abort(400, "Suspicious file content detected")
        
        return True
    
    @staticmethod
    def check_access_permission(media, user_id):
        """Can this user open this file?

        Public files (posts, profile photos) can be opened by anyone. A private file, such
        as a chat attachment, can be opened only by whoever uploaded it and by the sender
        and receiver of a message that carries it. user_id is the app database id of the
        signed-in user, or None when nobody is signed in.
        """
        if media.is_public:
            return True

        if user_id is None:
            return False

        if media.user_id == user_id:
            return True

        from app.models import Chat
        from sqlalchemy import or_

        return (
            Chat.query.filter(
                Chat.media_id == media.id,
                or_(Chat.sender_id == user_id, Chat.receiver_id == user_id),
            ).first()
            is not None
        )
