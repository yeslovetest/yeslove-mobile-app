"""Neptune repository for social graph operations."""
from typing import Any, Dict, List, Optional
import logging
from .neptune_client import NeptuneClient

logger = logging.getLogger(__name__)

class NeptuneRepository:
    """Repository for Neptune graph operations matching Neo4j interface."""
    
    def __init__(self, client: NeptuneClient):
        self.client = client
    
    def create_user(self, user_id: str, props: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create or update user node"""
        props = props or {}
        success = self.client.create_user(user_id, props)
        if success:
            result = {"user_id": user_id}
            result.update(props)
            return result
        return {}
    
    def merge_post_node(self, post_id: int, author_id: Optional[str] = None, props: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create post node and link to author"""
        props = props or {}
        if author_id:
            success = self.client.create_post(post_id, author_id, props)
        else:
            # Create post without author link
            success = self.client.create_post(post_id, "", props)
        
        if success:
            result = {"post_id": post_id}
            result.update(props)
            return result
        return {}
    
    def follow(self, follower_id: str, followed_id: str, follow_type: str = "basic") -> Dict[str, Any]:
        """Create follow relationship"""
        success = self.client.follow_user(follower_id, followed_id, follow_type)
        if success:
            return {
                "follower_id": follower_id,
                "followed_id": followed_id,
                "follow_type": follow_type
            }
        return {}
    
    def unfollow(self, follower_id: str, followed_id: str) -> None:
        """Remove follow relationship"""
        self.client.unfollow_user(follower_id, followed_id)
    
    def get_followers_page(self, user_id: str, skip: int = 0, limit: int = 100) -> List[str]:
        """Get paginated list of followers"""
        # Neptune doesn't have native skip, so we get more and slice
        all_followers = self.client.get_followers(user_id, limit + skip)
        return all_followers[skip:skip + limit]
    
    def get_follower_count(self, user_id: str) -> int:
        """Get follower count"""
        return self.client.get_follower_count(user_id)
    
    def like_post(self, user_id: str, post_id: int, reaction_type: Optional[str] = None) -> Dict[str, Any]:
        """Create like relationship to post"""
        reaction_type = reaction_type or "like"
        success = self.client.like_post(user_id, post_id, reaction_type)
        if success:
            return {
                "user_id": user_id,
                "post_id": post_id,
                "reaction_type": reaction_type
            }
        return {}
    
    def recommendations(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get user recommendations"""
        return self.client.get_recommendations(user_id, limit)