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
            # Get all followers from graph db
            follower_ids = []
            graph_repo = getattr(current_app, "graph_repository", None)

            try:
                if graph_repo:
                    author = User.query.get(author_id)
                    if author and author.keycloak_id:
                        follower_keycloak_ids = graph_repo.get_followers_page(author.keycloak_id, skip=0, limit=10000)
                        if follower_keycloak_ids:
                            followers = User.query.filter(User.keycloak_id.in_(follower_keycloak_ids)).all()
                            follower_ids = [u.id for u in followers]
            except Exception:
                current_app.logger.exception("Graph follower lookup failed")

            # If no followers found via graph, fallback to SQL model
            if not follower_ids:
                try:
                    follower_links = Follow.query.filter_by(followed_id=author_id).all()
                    follower_ids = [f.follower_id for f in follower_links]
                except Exception:
                    current_app.logger.exception("SQL follower lookup failed")

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