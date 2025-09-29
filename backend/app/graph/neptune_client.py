"""Amazon Neptune client using Gremlin for graph operations."""
import os
import logging
from gremlin_python.driver import client
from gremlin_python.driver.driver_remote_connection import DriverRemoteConnection
from gremlin_python.process.anonymous_traversal import traversal
from gremlin_python.process.graph_traversal import __
from gremlin_python.process.traversal import T
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

class NeptuneClient:
    def __init__(self, endpoint: str, port: int = 8182):
        self.endpoint = endpoint
        self.port = port
        self.connection = None
        self.g = None
        
    def connect(self):
        """Connect to Neptune using Gremlin"""
        try:
            connection_string = f"wss://{self.endpoint}:{self.port}/gremlin"
            self.connection = DriverRemoteConnection(connection_string, 'g')
            self.g = traversal().withRemote(self.connection)
            logger.info(f"Connected to Neptune at {self.endpoint}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Neptune: {e}")
            return False
    
    def close(self):
        """Close Neptune connection"""
        if self.connection:
            self.connection.close()
            logger.info("Neptune connection closed")
    
    def create_user(self, user_id: str, props: Optional[Dict[str, Any]] = None) -> bool:
        """Create or update user node"""
        try:
            props = props or {}
            traversal = self.g.V().has('User', 'user_id', user_id)
            
            if traversal.hasNext():
                # Update existing user
                user_vertex = traversal.next()
                for key, value in props.items():
                    self.g.V(user_vertex.id).property(key, value).next()
            else:
                # Create new user
                vertex = self.g.addV('User').property('user_id', user_id)
                for key, value in props.items():
                    vertex = vertex.property(key, value)
                vertex.next()
            
            return True
        except Exception as e:
            logger.error(f"Failed to create user {user_id}: {e}")
            return False
    
    def create_post(self, post_id: int, author_id: str, props: Optional[Dict[str, Any]] = None) -> bool:
        """Create post node and link to author"""
        try:
            props = props or {}
            
            # Create post vertex
            post_vertex = self.g.addV('Post').property('post_id', post_id)
            for key, value in props.items():
                post_vertex = post_vertex.property(key, value)
            post_vertex = post_vertex.next()
            
            # Create AUTHORED edge from user to post
            self.g.V().has('User', 'user_id', author_id).addE('AUTHORED').to(
                self.g.V().has('Post', 'post_id', post_id)
            ).next()
            
            return True
        except Exception as e:
            logger.error(f"Failed to create post {post_id}: {e}")
            return False
    
    def follow_user(self, follower_id: str, followed_id: str, follow_type: str = "basic") -> bool:
        """Create follow relationship"""
        try:
            self.g.V().has('User', 'user_id', follower_id).addE('FOLLOWS').to(
                self.g.V().has('User', 'user_id', followed_id)
            ).property('follow_type', follow_type).property('created_at', 'datetime()').next()
            
            return True
        except Exception as e:
            logger.error(f"Failed to create follow relationship: {e}")
            return False
    
    def unfollow_user(self, follower_id: str, followed_id: str) -> bool:
        """Remove follow relationship"""
        try:
            self.g.V().has('User', 'user_id', follower_id).outE('FOLLOWS').where(
                __.inV().has('user_id', followed_id)
            ).drop().next()
            
            return True
        except Exception as e:
            logger.error(f"Failed to unfollow: {e}")
            return False
    
    def get_followers(self, user_id: str, limit: int = 100) -> List[str]:
        """Get list of follower user IDs"""
        try:
            followers = self.g.V().has('User', 'user_id', user_id).in_('FOLLOWS').values('user_id').limit(limit).toList()
            return followers
        except Exception as e:
            logger.error(f"Failed to get followers for {user_id}: {e}")
            return []
    
    def get_follower_count(self, user_id: str) -> int:
        """Get follower count"""
        try:
            count = self.g.V().has('User', 'user_id', user_id).in_('FOLLOWS').count().next()
            return int(count)
        except Exception as e:
            logger.error(f"Failed to get follower count for {user_id}: {e}")
            return 0
    
    def like_post(self, user_id: str, post_id: int, reaction_type: str = "like") -> bool:
        """Create like relationship to post"""
        try:
            self.g.V().has('User', 'user_id', user_id).addE('LIKED').to(
                self.g.V().has('Post', 'post_id', post_id)
            ).property('reaction_type', reaction_type).property('created_at', 'datetime()').next()
            
            return True
        except Exception as e:
            logger.error(f"Failed to like post: {e}")
            return False

    def get_following(self, user_id: str, limit: int = 100) -> List[str]:
        """Get list of user IDs this user is following (outgoing FOLLOWS)"""
        try:
            following = self.g.V().has('User', 'user_id', user_id).out('FOLLOWS').values('user_id').limit(limit).toList()
            return following
        except Exception as e:
            logger.error(f"Failed to get following for {user_id}: {e}")
            return []
    
    def get_recommendations(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get user recommendations based on mutual follows"""
        try:
            recommendations = (
                self.g.V().has('User', 'user_id', user_id)
                .out('FOLLOWS').out('FOLLOWS')
                .where(__.not_(__.in_('FOLLOWS').has('user_id', user_id)))
                .where(__.has('user_id', __.neq(user_id)))
                .groupCount().by('user_id')
                .unfold()
                .order().by(__.select(__.values), __.desc)
                .limit(limit)
                .toList()
            )
            
            result = []
            for item in recommendations:
                user_id_rec = item[0]
                score = item[1]
                result.append({"user_id": user_id_rec, "score": score})
            
            return result
        except Exception as e:
            logger.error(f"Failed to get recommendations: {e}")
            return []

def create_neptune_client(endpoint: str, port: int = 8182) -> Optional[NeptuneClient]:
    """Create and connect Neptune client"""
    if not endpoint:
        logger.warning("Neptune endpoint not configured")
        return None
    
    client = NeptuneClient(endpoint, port)
    if client.connect():
        return client
    return None