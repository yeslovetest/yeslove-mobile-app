from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
import redis
import os

# Redis connection for rate limiting
try:
    redis_client = redis.Redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))
except:
    redis_client = None

def rate_limit(requests_per_minute=60, requests_per_hour=1000):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not redis_client:
                return f(*args, **kwargs)  # Skip if Redis unavailable
            
            # Get client identifier (IP + user if authenticated)
            client_id = request.remote_addr
            if hasattr(request, 'user') and request.user:
                client_id = f"{request.user.get('keycloak_id', client_id)}"
            
            # Check minute limit
            minute_key = f"rate_limit:{client_id}:minute:{datetime.now().strftime('%Y%m%d%H%M')}"
            minute_count = redis_client.get(minute_key) or 0
            
            if int(minute_count) >= requests_per_minute:
                return jsonify({"error": "Rate limit exceeded. Try again later."}), 429
            
            # Check hour limit
            hour_key = f"rate_limit:{client_id}:hour:{datetime.now().strftime('%Y%m%d%H')}"
            hour_count = redis_client.get(hour_key) or 0
            
            if int(hour_count) >= requests_per_hour:
                return jsonify({"error": "Hourly rate limit exceeded."}), 429
            
            # Increment counters
            redis_client.incr(minute_key)
            redis_client.expire(minute_key, 60)  # Expire after 1 minute
            redis_client.incr(hour_key)
            redis_client.expire(hour_key, 3600)  # Expire after 1 hour
            
            return f(*args, **kwargs)
        return wrapper
    return decorator

# Predefined rate limits for different endpoint types
auth_rate_limit = rate_limit(requests_per_minute=5, requests_per_hour=50)
read_rate_limit = rate_limit(requests_per_minute=100, requests_per_hour=1000)
write_rate_limit = rate_limit(requests_per_minute=20, requests_per_hour=200)
upload_rate_limit = rate_limit(requests_per_minute=5, requests_per_hour=50)