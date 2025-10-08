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
    @api.doc(security='Bearer')
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

            data = request.get_json() or {}
            title = data.get("title")
            content = data.get("content")
            
            # Handle image upload to S3 if provided
            image_url = data.get("image_url")
            if 'image' in request.files:
                from app.services.media.media_service import MediaService
                try:
                    upload_result = MediaService.upload_file(
                        file=request.files['image'],
                        user_id=user.id,
                        folder='blogs'
                    )
                    image_url = upload_result.get('s3_url') if upload_result else None
                except Exception as e:
                    logger.error(f"Blog image upload failed: {e}")

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

@api.route("/blogs")
class GetBlogs(Resource):
    from .blog_models import BlogListResponse
    @api.param("page", "Page number for pagination", type='integer', default=1)
    @api.param("per_page", "Number of blogs per page", type='integer', default=10)
    @api.response(200, "Success", BlogListResponse)
    def get(self):
        """Get all blog posts with pagination"""
        from app.models import BlogPost
        
        from app.utils.common_helpers import paginate_query
        
        try:
            query = BlogPost.query.order_by(BlogPost.timestamp.desc())
            result = paginate_query(query)
            
            return {
                "blogs": [{
                    "id": blog.id,
                    "title": blog.title,
                    "content": blog.content,
                    "author": blog.author.username,
                    "timestamp": blog.timestamp.isoformat(),
                    "image_url": blog.image_url,
                    "summary": blog.summary
                } for blog in result["items"]],
                "pagination": result["pagination"]
            }, 200
            
        except Exception as e:
            logger.exception("Error fetching blog posts")
            return {"message": "An error occurred while fetching blog posts."}, 500

@api.route("/blog/<int:blog_id>")
class GetBlog(Resource):
    from .blog_models import BlogResponse
    @api.response(200, "Success", BlogResponse)
    def get(self, blog_id):
        """Get a specific blog post by ID and track view"""
        from app.models import BlogPost, User, db
        from app.models import BlogView
        
        try:
            blog = BlogPost.query.get_or_404(blog_id)
            
            # Track blog view if user is authenticated
            auth_header = request.headers.get('Authorization')
            if auth_header:
                try:
                    from app.utils import verify_jwt
                    from app.utils.common_helpers import extract_jwt_token
                    token = extract_jwt_token()
                    user_info = verify_jwt(token)
                    if user_info:
                        user = User.query.filter_by(keycloak_id=user_info['sub']).first()
                        if user:
                            # Create or update blog view
                            existing_view = BlogView.query.filter_by(
                                user_id=user.id, blog_id=blog_id
                            ).first()
                            
                            if not existing_view:
                                blog_view = BlogView(user_id=user.id, blog_id=blog_id)
                                db.session.add(blog_view)
                                db.session.commit()
                except Exception as e:
                    logger.warning(f"Failed to track blog view: {e}")
            
            return {
                "id": blog.id,
                "title": blog.title,
                "content": blog.content,
                "author": blog.author.username,
                "timestamp": blog.timestamp.isoformat(),
                "image_url": blog.image_url,
                "summary": blog.summary
            }, 200
            
        except Exception as e:
            logger.exception(f"Error fetching blog post {blog_id}")
            return {"message": "Blog post not found."}, 404