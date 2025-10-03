from app.services.sqs_service import SQSService
from app.services.feed_cache_service import FeedCacheService
from app.models import Follow, User
from flask import current_app

class FanoutService:
    def __init__(self):
        self.sqs_service = SQSService()
        self.feed_cache = FeedCacheService()
    
    def fanout_post(self, post_id: int, author_id: int):
        """Fanout new post to all followers"""
        try:
            # Get all followers
            followers = Follow.query.filter_by(followed_id=author_id).all()
            follower_ids = [f.follower_id for f in followers]
            
            if not follower_ids:
                return
            
            # Queue fanout job for background processing
            fanout_job = {
                'job_type': 'fanout_post',
                'post_id': post_id,
                'author_id': author_id,
                'follower_ids': follower_ids
            }
            
            self.sqs_service.send_message(fanout_job)
            current_app.logger.info(f"Queued fanout for post {post_id} to {len(follower_ids)} followers")
            
        except Exception as e:
            current_app.logger.error(f"Fanout error: {e}")
    
    def process_fanout(self, post_id: int, author_id: int, follower_ids: list):
        """Process fanout job - invalidate follower feeds"""
        try:
            # Invalidate feed cache for all followers
            for follower_id in follower_ids:
                self.feed_cache.invalidate_user_feed(follower_id)
            
            current_app.logger.info(f"Processed fanout for post {post_id}")
            
        except Exception as e:
            current_app.logger.error(f"Fanout processing error: {e}")
    
    def fanout_follow(self, follower_id: int, followed_id: int):
        """Handle new follow - invalidate follower's feed"""
        self.feed_cache.invalidate_user_feed(follower_id)
    
    def fanout_unfollow(self, follower_id: int, followed_id: int):
        """Handle unfollow - invalidate follower's feed"""
        self.feed_cache.invalidate_user_feed(follower_id)