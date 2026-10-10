from functools import wraps
from flask import request, jsonify
from datetime import datetime
import redis
import os

from app.logging_setup import setup_logger

logger = setup_logger()

# Lazily-connecting client: redis-py doesn't open a socket until the first
# command, so this never blocks startup and a Redis outage is retried on
# every request instead of disabling rate limiting for the process lifetime.
redis_client = redis.Redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))


def rate_limit(requests_per_minute=60, requests_per_hour=1000):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            try:
                # Get client identifier (IP + user if authenticated)
                client_id = request.remote_addr
                if hasattr(request, 'user') and getattr(request, 'user', None):
                    client_id = f"{request.user.get('keycloak_id', client_id)}"

                minute_key = f"rate_limit:{client_id}:minute:{datetime.now().strftime('%Y%m%d%H%M')}"
                hour_key = f"rate_limit:{client_id}:hour:{datetime.now().strftime('%Y%m%d%H')}"

                # INCR is atomic in Redis, so concurrent requests can't both read
                # a count below the limit and both be admitted (the previous
                # check-then-increment version had that race). Expiry is set
                # only on the request that created the key (count == 1) so it
                # isn't refreshed away from its original window on every hit.
                minute_count = redis_client.incr(minute_key)
                if minute_count == 1:
                    redis_client.expire(minute_key, 60)

                hour_count = redis_client.incr(hour_key)
                if hour_count == 1:
                    redis_client.expire(hour_key, 3600)

                if minute_count > requests_per_minute:
                    return jsonify({"error": "Rate limit exceeded. Try again later."}), 429

                if hour_count > requests_per_hour:
                    return jsonify({"error": "Hourly rate limit exceeded."}), 429

            except redis.exceptions.RedisError as e:
                # Redis down or unreachable — fail open so an outage of the
                # limiter doesn't take the API down with it.
                logger.warning(f"Rate limiter unavailable, skipping limit: {e}")
                return f(*args, **kwargs)

            return f(*args, **kwargs)
        return wrapper
    return decorator


# --- Predefined rate limits for different endpoint types ---
auth_rate_limit = rate_limit(requests_per_minute=5, requests_per_hour=50)
read_rate_limit = rate_limit(requests_per_minute=100, requests_per_hour=1000)
write_rate_limit = rate_limit(requests_per_minute=20, requests_per_hour=200)
upload_rate_limit = rate_limit(requests_per_minute=5, requests_per_hour=50)
