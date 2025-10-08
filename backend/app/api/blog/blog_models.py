from .blog_routes import api
from flask_restx import fields
from datetime import datetime

CreateBlogPost = api.model("CreateBlogPost", {
    "title": fields.String(required=True, description="Title of the blog post"),
    "content": fields.String(required=True, description="Blog post content"),
    "summary": fields.String(required=False, description="Blog post Summary /short intro to Blog"),
    "image": fields.Raw(required=False, description="Blog image file (will be uploaded to S3)"),
    "image_url": fields.String(required=False, description="Optional image URL (alternative to file upload)")
})

BlogResponse = api.model("BlogResponse", {
    "id": fields.Integer(description="Blog post ID"),
    "title": fields.String(description="Blog post title"),
    "content": fields.String(description="Blog post content"),
    "author": fields.String(description="Author username"),
    "timestamp": fields.String(description="Creation timestamp"),
    "image_url": fields.String(description="Image URL"),
    "summary": fields.String(description="Blog summary")
})

BlogListResponse = api.model("BlogListResponse", {
    "blogs": fields.List(fields.Nested(BlogResponse)),
    "pagination": fields.Raw(description="Pagination info")
})

# BlogView model moved to avoid circular imports
# Import it from models.py instead