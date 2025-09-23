from .blog_routes import api
from flask_restx import fields

CreateBlogPost = api.model("CreateBlogPost", {
    "title": fields.String(required=True, description="Title of the blog post"),
    "content": fields.String(required=True, description="Blog post content"),
    "image_url": fields.String(required=False, description="Optional image URL")
})