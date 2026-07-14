from celery import Celery
from app.services.chatbot_client import ChatbotClient
import os

# Initialize Celery
celery = Celery('chatbot_sync')
celery.conf.broker_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
celery.conf.result_backend = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

chatbot_client = ChatbotClient()



@celery.task
def sync_blog_to_chatbot(blog_id: int):
    """Deprecated local-blog sync hook retained for worker compatibility."""
    return {
        "error": "Local blog sync is deprecated. Blogs are synced from WordPress.",
        "blog_id": blog_id,
    }


@celery.task
def sync_wordpress_blogs_to_chatbot(page: int = 1, per_page: int = 25):
    """Ask chatbot service to refresh directly from WordPress."""
    return chatbot_client.sync_wordpress_blog_posts(page=page, per_page=per_page)


@celery.task
def sync_cached_blogs_to_chatbot(page: int = 1, per_page: int = 25):
    """Sync cached app DB blog rows into the chatbot document store."""
    from app.models import BlogPost

    pagination = (
        BlogPost.query
        .filter(BlogPost.source == "wordpress")
        .order_by(BlogPost.timestamp.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )
    payloads = []
    for blog in pagination.items:
        source_id = blog.wp_post_id or blog.id
        payloads.append({
            "id": blog.id,
            "source_id": source_id,
            "resource_id": f"wordpress_blog:{source_id}",
            "source": "wordpress",
            "type": "blog",
            "title": blog.title,
            "content": blog.content,
            "summary": blog.summary,
            "author": blog.author.username if blog.author else "YesLove",
            "timestamp": blog.timestamp.isoformat() if blog.timestamp else None,
            "published_at": blog.timestamp.isoformat() if blog.timestamp else None,
            "url": blog.link,
            "image_url": blog.image_url,
        })

    return chatbot_client.sync_blog_posts(payloads)
