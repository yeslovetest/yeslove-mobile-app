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
                    user_ids = [r["user_id"] for r in recommendations]
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
                logger.warning(f"Neptune recommendations failed: {e}")
        
        # Fallback: recommend users with most followers
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
        """Get recommended blogs based on user reading history"""
        from app.models import User, BlogPost, db
        from app.models import BlogView
        from sqlalchemy import func, and_
        
        current_user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not current_user:
            return {"message": "User not found"}, 404
        
        limit = int(request.args.get("limit", 10))
        
        # Get blogs viewed by users with similar reading patterns
        similar_users_blogs = BlogPost.query\
            .join(BlogView, BlogPost.id == BlogView.blog_id)\
            .join(User, BlogView.user_id == User.id)\
            .filter(
                and_(
                    BlogView.user_id.in_(
                        # Users who read similar blogs as current user
                        db.session.query(BlogView.user_id)
                        .join(BlogView, BlogView.blog_id.in_(
                            db.session.query(BlogView.blog_id)
                            .filter(BlogView.user_id == current_user.id)
                        ))
                        .filter(BlogView.user_id != current_user.id)
                    ),
                    # Exclude blogs already read by current user
                    BlogPost.id.notin_(
                        db.session.query(BlogView.blog_id)
                        .filter(BlogView.user_id == current_user.id)
                    )
                )
            )\
            .group_by(BlogPost.id)\
            .order_by(func.count(BlogView.id).desc())\
            .limit(limit).all()
        
        # Fallback: popular blogs if no similar users found
        if not similar_users_blogs:
            similar_users_blogs = BlogPost.query\
                .join(BlogView, BlogPost.id == BlogView.blog_id)\
                .filter(
                    BlogPost.id.notin_(
                        db.session.query(BlogView.blog_id)
                        .filter(BlogView.user_id == current_user.id)
                    )
                )\
                .group_by(BlogPost.id)\
                .order_by(func.count(BlogView.id).desc())\
                .limit(limit).all()
        
        return {
            "recommended_blogs": [
                {
                    "id": b.id,
                    "title": b.title,
                    "summary": b.summary or b.content[:200] + "...",
                    "author": b.author.username,
                    "timestamp": b.timestamp.isoformat(),
                    "image_url": b.image_url
                } for b in similar_users_blogs
            ]
        }, 200