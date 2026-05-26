from .blog_routes import api
from flask_restx import fields
from datetime import datetime

CreateBlogPost = api.model("CreateBlogPost", {
    "title": fields.String(required=True, description="Title of the blog post"),
    "content": fields.String(required=True, description="Blog post content"),
    "summary": fields.String(required=False, description="Blog post Summary /short intro to Blog"),
    "image": fields.Raw(required=False, description="Blog image file (will be uploaded to object storage)"),
    "image_url": fields.String(required=False, description="Optional image URL (alternative to file upload)")
})

BlogPostModel = api.model("BlogPostModel", {
    "id" : fields.Integer(description="Post ID"),
    "title" : fields.String(description="Title"),
    "content" : fields.String(description="Content"),
    "summary" : fields.String(description="Summary"),
    "image_url": fields.String(description="Image URL"),
    "author_id" : fields.Integer(description="Author user ID"),
    "author" : fields.String(description="Author username"),
    "timestamp" : fields.String(description="UTC timestamp (ISO 8601)")
})

BlogPostList = api.model("BlogPostList", {
    "items" : fields.List(fields.Nested(BlogPostModel)),
    "total" : fields.Integer(description="Total matching posts"),
    "page" : fields.Integer(description="Current page"),
    "per_page" : fields.Integer(description="Items per page")
})
   

# BlogView model moved to avoid circular imports
# Import it from models.py instead
