from flask import request
from flask_restx import Namespace, Resource
from app.logging_setup import setup_logger
from app.services.wordpress_blog_service import (
    fetch_wordpress_post,
    get_cached_blog_post,
    list_cached_blog_posts,
    sync_wordpress_posts_to_db,
    upsert_wordpress_posts,
)
from app.utils import require_auth
import requests
# Removed: from app.notifications import send_push_notification_to_all_users

api = Namespace("blog", description="API Endpoints")

logger = setup_logger() 

def _is_admin() -> bool:
    keycloak_roles = request.user.get("realm_access", {}).get("roles", [])
    return "admin" in keycloak_roles

@api.route("/blog-posts")
class BlogPosts(Resource):
    from .blog_models import BlogPostList
    
    @require_auth()
    @api.doc(security='Bearer', description="Reject local blog creation because WordPress is the source of truth")
    @api.response(403, "Access denied. Admins only")
    @api.response(409, "Create blog content in WordPress")
    def post(self):
        """Reject local blog creation because WordPress owns blog content."""
        if not _is_admin():
            return {"message": "Access denied. Admins only."}, 403

        return {
            "message": "Blog posts must be created in WordPress. yeslove.co.uk is the source of truth.",
            "wordpress_admin_url": "https://yeslove.co.uk/wp-admin/edit.php"
        }, 409

    @api.doc(description="List WordPress blog posts with pagination and search")
    @api.param("page", "Page number (default 1)", type="integer")
    @api.param("per_page", "Items per page (default 10, max 100)", type="integer")
    @api.param("q", "Search string for author name, title, or content")
    @api.response(200, "Success", BlogPostList)
    def get(self):
        """List blog posts from WordPress, the source of truth."""
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
        refresh = request.args.get("refresh", "").lower() in {"1", "true", "yes"}

        try:
            if refresh:
                items, total = sync_wordpress_posts_to_db(page, per_page, q)
            else:
                items, total = list_cached_blog_posts(page, per_page, q)
                if not items and page == 1:
                    items, total = sync_wordpress_posts_to_db(page, per_page, q)
        except requests.RequestException:
            logger.exception("Error fetching WordPress blog posts")
            if refresh:
                return {"message": "Could not refresh blog posts from WordPress"}, 502
            items, total = list_cached_blog_posts(page, per_page, q)

        return {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page
        }, 200


@api.route("/blog-posts/sync")
class SyncBlogPosts(Resource):
    @require_auth()
    @api.doc(security='Bearer', description="Refresh cached blog posts from WordPress")
    @api.param("page", "WordPress page number (default 1)", type="integer")
    @api.param("per_page", "Items per page (default 25, max 100)", type="integer")
    @api.response(200, "Blog cache refreshed")
    @api.response(403, "Access denied. Admins only")
    @api.response(502, "Could not refresh from WordPress")
    def post(self):
        if not _is_admin():
            return {"message": "Access denied. Admins only."}, 403

        try:
            page = max(int(request.args.get("page", 1)), 1)
        except ValueError:
            page = 1

        try:
            per_page = int(request.args.get("per_page", 25))
        except ValueError:
            per_page = 25

        per_page = max(1, min(per_page, 100))

        try:
            items, total = sync_wordpress_posts_to_db(page=page, per_page=per_page)
        except requests.RequestException:
            logger.exception("Error syncing WordPress blog posts")
            return {"message": "Could not refresh blog posts from WordPress"}, 502

        return {
            "message": "Blog cache refreshed from WordPress",
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
        }, 200


@api.route("/blog-posts/import")
class ImportBlogPost(Resource):
    @require_auth()
    @api.doc(security='Bearer', description="Reject local document import because WordPress is the source of truth")
    @api.response(403, "Access denied. Admins only")
    @api.response(409, "Import blog documents in WordPress")
    def post(self):
        """Reject local document import because WordPress owns blog content."""
        if not _is_admin():
            return {"message": "Access denied. Admins only."}, 403

        return {
            "message": "Import blog documents in WordPress so yeslove.co.uk remains the source of truth.",
            "wordpress_admin_url": "https://yeslove.co.uk/wp-admin/edit.php"
        }, 409


@api.route("/blog-posts/<int:post_id>")
class GetSingleBlog(Resource):
    """Gets a single blog post by ID"""

    from .blog_models import BlogPostModel
    @api.doc(description="Retrieve a single blog post by its ID")
    @api.response(200, "Success", BlogPostModel)
    @api.response(404, "Blog post not found")
    def get(self, post_id):
        cached_post = get_cached_blog_post(post_id)
        if cached_post:
            return cached_post, 200

        try:
            post = fetch_wordpress_post(post_id)
            cached_posts = upsert_wordpress_posts([post])
            if cached_posts:
                return cached_posts[0], 200
        except requests.HTTPError as exc:
            if exc.response is not None and exc.response.status_code == 404:
                return {"message": "Blog post not found"}, 404
            logger.exception("Error fetching WordPress blog post")
            return {"message": "Could not fetch blog post from WordPress"}, 502
        except requests.RequestException:
            logger.exception("Error fetching WordPress blog post")
            return {"message": "Could not fetch blog post from WordPress"}, 502

        if not post:
            return {"message": "Blog post not found"}, 404

        return post, 200
