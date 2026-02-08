from celery import Celery
from app.services.chatbot_client import ChatbotClient
from app.models import Post, BlogPost, User
from app import db
import os

# Initialize Celery
celery = Celery('chatbot_sync')
celery.conf.broker_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
celery.conf.result_backend = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

chatbot_client = ChatbotClient()



@celery.task
def sync_blog_to_chatbot(blog_id: int):
    """Sync individual blog post to chatbot service"""
    try:
        blog = BlogPost.query.get(blog_id)
        if not blog:
            return {"error": "Blog post not found"}
        
        blog_data = {
            "id": blog.id,
            "title": blog.title,
            "content": blog.content,
            "author": blog.author.username if blog.author else "YesLove",
            "timestamp": blog.timestamp.isoformat() if blog.timestamp else None
        }
        
        result = chatbot_client.sync_blog_posts([blog_data])
        return result
        
    except Exception as e:
        return {"error": str(e)}

