from flask import request
from flask_restx import Namespace, Resource
from app.logging_setup import setup_logger
from app.utils import require_auth
from datetime import datetime

# create a logger instance 
logger = setup_logger()

api = Namespace("blog", description="API Endpoints")


@api.route("/blog-post")
class CreateBlog(Resource):
    from .blog_models import CreateBlogPost
    """Endpoint for creating blog posts for the Get Educated page (Admins only)."""   
    @require_auth()
    @api.expect(CreateBlogPost)
    def post(self):
        """Create a blog post for the Get Educated page (Admins only)."""
        from app.models import BlogPost, User, db
        try:
            # ✅ Get Keycloak roles and log them
            keycloak_roles = request.user.get("realm_access", {}).get("roles", [])
            logger.info(f"User roles from Keycloak: {', '.join(keycloak_roles) if keycloak_roles else 'No roles found'}")

            if "admin" not in keycloak_roles:
                logger.warning(f"Unauthorized blog post creation attempt by user {request.user.get('keycloak_id')}")
                return {"message": "Access denied. Admins only."}, 403

            data = request.get_json()
            title = data.get("title")
            content = data.get("content")
            image_url = data.get("image_url")

            # ✅ Basic validation
            if not title or not content:
                return {"message": "Title and content are required"}, 400

            user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
            if not user:
                logger.error(f"User not found: {request.user.get('keycloak_id')}")
                return {"message": "Authenticated user not found"}, 404

            post = BlogPost(
                title=title,
                content=content,
                author_id=user.id,
                image_url=image_url,
                timestamp=datetime.utcnow()
            )
            db.session.add(post)
            db.session.commit()
            
            # Send push notification to all users about new blog post
            from app.models import User as AllUsers
            from app.services.push_notification_service import PushNotificationService
            
            # Get all user IDs (or you could target specific user groups)
            all_user_ids = [u.id for u in AllUsers.query.all()]
            
            if all_user_ids:
                try:
                    PushNotificationService.send_to_multiple_users(
                        user_ids=all_user_ids,
                        title="New Blog Post",
                        body=f"New article: {title[:50]}...",
                        data={"type": "new_blog", "blog_id": post.id},
                        notification_type="blogs"
                    )
                except Exception as e:
                    logger.error(f"Blog notification failed: {e}")

            logger.info(f"Blog post created by user {user.id}: {post.id}")

            return {
                "message": "Blog post created successfully",
                "post_id": post.id
            }, 201

        except Exception as e:
            logger.exception("Error creating blog post")
            db.session.rollback()
            return {"message": "An error occurred while creating the blog post."}, 500