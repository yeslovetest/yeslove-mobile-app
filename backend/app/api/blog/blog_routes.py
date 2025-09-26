from flask import request
from flask_restx import Namespace, Resource
from app.logging_setup import logger
from app.utils import require_auth
from datetime import datetime
from app.notifications import send_push_notification_to_all_users
from app.models import BlogPost

api = Namespace("blog", description="API Endpoints")


@api.route("/blog-posts")
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
            summary = data.get("summary")
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

            # Send push notification to all users
            try:
                send_push_notification_to_all_users(
                    title="New Blog Post",
                    message=f"{title}",
                    data={"post_id": post.id}
                )
            except Exception as notify_err:
                logger.error(f"Failed to send push notification for blog post {post.id}: {notify_err}")

            return {
                "message": "Blog post created successfully",
                "post_id": post.id
            }, 201

        except Exception as e:
            logger.exception("Error creating blog post")
            db.session.rollback()
            return {"message": "An error occurred while creating the blog post."}, 500


@api.route("/blog-posts/<int:post_id>")
class GetSingleBlog(Resource):
    "Gets a single blog post by ID"
    @api.marshal_with(api.models.get("BlogPost"))
    def get(self, post_id):
        from app.models import BlogPost
        post = BlogPost.query.get(post_id)
        if not post:
            return {"message" : "Blog post not found"}, 400
        
        return {
            "id" : post.id, 
            "title" : post.title,
            "content" : post.content,
            "summary" : getattr(post, "summary", None),
            "image_url": getattr(post, "image_url", None),
            "author_id" : post.author_id,
            "timestamp": post.timestamp.isoformat() + "Z" if post.timestamp else None
        }, 200
    

@api.route("/blog-posts")
class ListBlogs(Resource):
    "Lists blog post with optional pagination and search"
    @api.doc(params={
        "page" : "Page number (default 1)"
        "per_page" : "Items per page (default 10, max 100)"
        "q" : "Search string for title/count"
        "author_id" : "Filter by author user ID"
    })
    @api.marshal_list_with(api.model.get("BlogPostList"))
    def get(self):
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
        author_id = request.args.get("author_id", type=int)

        # Base query
        query = BlogPost.query

        # Filters
        if q:
            ilike = f"%{q}%"
            query = query.filter(
                (BlogPost.title.ilike(ilike)) | (BlogPost.content.ilike(ilike))
            )

        if author_id:
            query = query.filter(BlogPost.author_id == author_id)

        # Order newest first
        query = query.order_by(BlogPost.timestamp.desc())

        # Pagination (SQL Alchemy)
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)


        items = []
        for post in pagination.items:
            items.append({
                "id" : post.id,
                "title" : post.title,
                "content" : post.content,
                "summary" : getattr(post, "summary", None), 
                "image_url" : getattr(post, "image_url", None),
                "author_id" : post.author_id,
                "timestamp" : post.timestamp.isoformat() + "Z" if post.timestamp  else None
                })
            
        return {
            "items" : items,
            "total" : pagination.total,
            "page" : page,
            "per_page" : per_page
        }, 200
    
    