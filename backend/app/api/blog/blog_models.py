from .blog_routes import api
from flask_restx import fields
from app import db
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

class BlogView(db.Model):
    __tablename__ = 'blog_view'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    blog_id = db.Column(db.Integer, db.ForeignKey('blog_posts.id'), nullable=False)
    viewed_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_duration = db.Column(db.Integer)  # seconds spent reading
    
    # Relationships
    user = db.relationship('User', backref='blog_views')
    blog = db.relationship('BlogPost', backref='views')
    
    __table_args__ = (db.UniqueConstraint('user_id', 'blog_id', name='unique_user_blog_view'),)