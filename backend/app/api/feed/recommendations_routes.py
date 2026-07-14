from flask import request, current_app
from flask_restx import Namespace, Resource
from app.utils import require_auth
from app.logging_setup import setup_logger

logger = setup_logger()
api = Namespace("recommendations", description="User Recommendation Endpoints")

@api.route("/users")
class UserRecommendations(Resource):
    @require_auth()
    @api.doc(security='Bearer')
    @api.param('limit', 'Number of recommendations to return', type='integer', default=10)
    def get(self):
        """Get user recommendations based on graph analysis"""
        from app.models import User
        
        current_user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not current_user:
            return {"message": "User not found"}, 404
        
        limit = int(request.args.get("limit", 10))

        if hasattr(current_app, 'graph_repository'):
            try:
                recommendations = current_app.graph_repository.recommendations(
                    user_id=current_user.keycloak_id,
                    limit=limit
                )
                if recommendations:
                    user_ids = [r["user_id"] for r in recommendations if r.get("user_id")]
                    users = User.query.filter(User.keycloak_id.in_(user_ids)).all()
                    return {
                        "recommendations": [
                            {
                                "keycloak_id": u.keycloak_id,
                                "username": u.username,
                                "profile_pic_url": u.profile_pic_url,
                                "user_type": u.user_type
                            } for u in users
                        ]
                    }, 200
            except Exception as e:
                logger.warning(f"Graph recommendations failed: {e}")
        
        # Recommend users with most followers.
        from app.models import Follow
        from sqlalchemy import func
        
        popular_users = User.query.join(Follow, User.id == Follow.followed_id)\
            .filter(User.id != current_user.id)\
            .group_by(User.id)\
            .order_by(func.count(Follow.follower_id).desc())\
            .limit(limit).all()
        
        return {
            "recommendations": [
                {
                    "keycloak_id": u.keycloak_id,
                    "username": u.username,
                    "profile_pic_url": u.profile_pic_url,
                    "user_type": u.user_type
                } for u in popular_users
            ]
        }, 200

@api.route("/posts")
class PostRecommendations(Resource):
    @require_auth()
    @api.doc(security='Bearer')
    @api.param('limit', 'Number of posts to return', type='integer', default=20)
    def get(self):
        """Get recommended posts based on user interests"""
        from app.models import User, Post, Like, Follow
        from sqlalchemy import func
        
        current_user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not current_user:
            return {"message": "User not found"}, 404
        
        limit = int(request.args.get("limit", 20))
        
        # Get posts liked by people user follows
        recommended_posts = Post.query.join(Like, Post.id == Like.post_id)\
            .join(Follow, Like.user_id == Follow.followed_id)\
            .filter(Follow.follower_id == current_user.id)\
            .filter(Post.user_id != current_user.id)\
            .group_by(Post.id)\
            .order_by(func.count(Like.id).desc())\
            .limit(limit).all()
        
        return {
            "recommended_posts": [
                {
                    "id": p.id,
                    "content": p.content,
                    "author": p.author.username,
                    "author_id": p.author.keycloak_id,
                    "image_url": p.image_url,
                    "timestamp": p.timestamp.isoformat(),
                    "likes": len(p.likes)
                } for p in recommended_posts
            ]
        }, 200

@api.route("/blogs")
class BlogRecommendations(Resource):
    @require_auth()
    @api.doc(security='Bearer')
    @api.param('limit', 'Number of blogs to return', type='integer', default=10)
    def get(self):
        """Get recommended blogs from the local WordPress-backed cache."""
        import requests
        from app.models import User
        from app.services.wordpress_blog_service import list_cached_blog_posts, sync_wordpress_posts_to_db
        
        current_user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not current_user:
            return {"message": "User not found"}, 404
        
        limit = int(request.args.get("limit", 10))
        limit = max(1, min(limit, 100))

        try:
            blogs, _ = list_cached_blog_posts(page=1, per_page=limit)
            if not blogs:
                blogs, _ = sync_wordpress_posts_to_db(page=1, per_page=limit)
        except requests.RequestException:
            logger.exception("Error refreshing WordPress blog recommendations")
            blogs, _ = list_cached_blog_posts(page=1, per_page=limit)

        return {
            "recommended_blogs": [
                {
                    "id": blog["id"],
                    "wp_post_id": blog["wp_post_id"],
                    "title": blog["title"],
                    "summary": blog["summary"],
                    "author": blog["author"],
                    "timestamp": blog["timestamp"],
                    "image_url": blog["image_url"],
                    "link": blog["link"],
                    "url": blog["url"],
                    "source": "wordpress",
                } for blog in blogs
            ]
        }, 200
