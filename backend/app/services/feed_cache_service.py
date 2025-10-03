import redis
import json
import os
from typing import List, Dict, Any, Optional
from flask import current_app

class FeedCacheService:
    def __init__(self):
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        self.redis_client = redis.from_url(redis_url)
        self.cache_ttl = 3600  # 1 hour
    
    def get_user_feed(self, user_id: int, page: int = 1, per_page: int = 10) -> Optional[List[Dict]]:
        """Get cached user feed"""
        cache_key = f"feed:user:{user_id}:page:{page}:size:{per_page}"
        try:
            cached_feed = self.redis_client.get(cache_key)
            if cached_feed:
                return json.loads(cached_feed)
        except Exception as e:
            current_app.logger.error(f"Feed cache get error: {e}")
        return None
    
    def cache_user_feed(self, user_id: int, feed_data: List[Dict], page: int = 1, per_page: int = 10):
        """Cache user feed"""
        cache_key = f"feed:user:{user_id}:page:{page}:size:{per_page}"
        try:
            self.redis_client.setex(
                cache_key, 
                self.cache_ttl, 
                json.dumps(feed_data, default=str)
            )
        except Exception as e:
            current_app.logger.error(f"Feed cache set error: {e}")
    
    def invalidate_user_feed(self, user_id: int):
        """Invalidate all cached pages for user"""
        try:
            pattern = f"feed:user:{user_id}:*"
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
        except Exception as e:
            current_app.logger.error(f"Feed cache invalidation error: {e}")
    
    def invalidate_followers_feeds(self, user_id: int):
        """Invalidate feeds of all followers when user posts"""
        from app.models import Follow
        followers = Follow.query.filter_by(followed_id=user_id).all()
        for follow in followers:
            self.invalidate_user_feed(follow.follower_id)