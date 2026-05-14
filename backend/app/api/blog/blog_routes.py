from flask import current_app, request
from flask_restx import Namespace, Resource
from app.logging_setup import setup_logger
from app.utils import require_auth
from datetime import datetime
# Removed: from app.notifications import send_push_notification_to_all_users

api = Namespace("blog", description="API Endpoints")

logger = setup_logger() 

@api.route("/blog-posts")
class BlogPosts(Resource):
    from .blog_models import CreateBlogPost, BlogPostModel, BlogPostList
    
    @require_auth()
    @api.doc(security='Bearer', description="Create a new blog post (Admin only)")
    @api.expect(CreateBlogPost)
    @api.response(201, "Blog post created successfully")
    @api.response(400, "Title and content are required")
    @api.response(403, "Access denied. Admins only")
    @api.response(404, "Authenticated user not found")
    @api.response(500, "An error occurred while creating the blog post")
    def post(self):
        """Create a blog post for the Get Educated page (Admin only)."""
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
            summary = data.get("summary")
            
            # Accept a pre-uploaded object storage URL if provided
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
                summary=summary,
                timestamp=datetime.utcnow()
            )
            db.session.add(post)
            db.session.commit()

            logger.info(f"Blog post created by user {user.id}: {post.id}")

            # Send notification to all users via SQS
            try:
                from app.services.sqs_service import SQSService
                from app.models import User
                
                # Get all user IDs for batch notification
                all_users = User.query.with_entities(User.id).all()
                user_ids = [user.id for user in all_users]
                
                if user_ids:
                    sqs = SQSService()
                    sqs.send_message({
                        'job_type': 'notification_batch',
                        'user_ids': user_ids,
                        'title': 'New Blog Post',
                        'body': f'{title}',
                        'notification_type': 'blogs',
                        'data': {'type': 'blog', 'post_id': post.id}
                    })
            except Exception as notify_err:
                logger.error(f"Failed to queue blog notification for post {post.id}: {notify_err}")

            # Sync blog content to chatbot after commit so chatbot recommendations stay fresh.
            try:
                from app.services.chatbot_client import ChatbotClient

                blog_url_template = current_app.config.get("BLOG_PUBLIC_URL_TEMPLATE")
                blog_url = blog_url_template.format(blog_id=post.id, id=post.id) if blog_url_template else None
                sync_result = ChatbotClient(timeout=5).sync_blog_post(post, url=blog_url)
                if sync_result.get("error"):
                    logger.error(f"Failed to sync blog post {post.id} to chatbot: {sync_result['error']}")
                else:
                    logger.info(f"Synced blog post {post.id} to chatbot")
            except Exception as chatbot_err:
                logger.error(f"Failed to sync blog post {post.id} to chatbot: {chatbot_err}")

            return {
                "message": "Blog post created successfully",
                "post_id": post.id
            }, 201

        except Exception as e:
            logger.exception("Error creating blog post")
            db.session.rollback()
            return {"message": "An error occurred while creating the blog post."}, 500

    @api.doc(description="List blog posts with pagination, search, and filtering")
    @api.param("page", "Page number (default 1)", type="integer")
    @api.param("per_page", "Items per page (default 10, max 100)", type="integer")
    @api.param("q", "Search string for author name, title, or content")
    @api.response(200, "Success", BlogPostList)
    @api.marshal_with(BlogPostList)
    def get(self):
        """List blog posts with pagination, search, and filtering."""
        from app.models import BlogPost, User
        # Query parameters
        try:
            page = max(int(request.args.get("page", 1)), 1)
        except ValueError:
            page = 1

        try:
            per_page = int(request.args.get("per_page", 10))
        except ValueError:
            per_page = 10

        per_page = max(1, min(per_page, 100))

        q = request.args.get("q")

        # Base query
        query = BlogPost.query.join(User, BlogPost.author)

        # Search filter
        if q:
            ilike = f"%{q}%"
            query = query.filter(
                (BlogPost.title.ilike(ilike)) |
                (BlogPost.content.ilike(ilike)) |
                (User.username.ilike(ilike))
            )

        # Order newest first
        query = query.order_by(BlogPost.timestamp.desc())

        # Pagination
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        items = []
        for post in pagination.items:
            items.append({
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "summary": getattr(post, "summary", None),
                "image_url": getattr(post, "image_url", None),
                "author_id": post.author_id,
                "author": post.author.username if post.author else None,
                "timestamp": post.timestamp.isoformat() + "Z" if post.timestamp else None
            })

        return {
            "items": items,
            "total": pagination.total,
            "page": page,
            "per_page": per_page
        }, 200


@api.route("/blog-posts/<int:post_id>")
class GetSingleBlog(Resource):
    """Gets a single blog post by ID"""

    from .blog_models import BlogPostModel
    @api.doc(description="Retrieve a single blog post by its ID")
    @api.response(200, "Success", BlogPostModel)
    @api.response(404, "Blog post not found")
    @api.marshal_with(BlogPostModel)
    def get(self, post_id):
        from app.models import BlogPost
        post = BlogPost.query.get(post_id)
        if not post:
            return {"message": "Blog post not found"}, 404

        return {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "summary": getattr(post, "summary", None),
            "image_url": getattr(post, "image_url", None),
            "author_id": post.author_id,
            "author": post.author.username if post.author else None,
            "timestamp": post.timestamp.isoformat() + "Z" if post.timestamp else None
        }, 200
