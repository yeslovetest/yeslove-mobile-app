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
        
        result = chatbot_client.sync_blog_post(blog)
        return result
        
    except Exception as e:
        return {"error": str(e)}
