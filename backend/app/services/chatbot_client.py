import os
import requests
from typing import Dict, Any, Optional

class ChatbotClient:
    def __init__(self, timeout: Optional[int] = None):
        self.base_url = os.getenv("CHATBOT_SERVICE_URL", "http://localhost:8000")
        self.timeout = timeout or int(os.getenv("CHATBOT_SERVICE_TIMEOUT", "30"))

    def send_message(
        self,
        message: str,
        user_id: int,
        history: list = None,
        session_id: str = None,
        auth_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send message to chatbot service"""
        try:
            headers = {"Authorization": auth_token} if auth_token else None
            response = requests.post(
                f"{self.base_url}/api/v1/chat/message",
                json={
                    "message": message,
                    "user_id": user_id,
                    "history": history or [],
                    "session_id": session_id
                },
                headers=headers,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Chatbot service unavailable: {str(e)}"}



    def sync_blog_posts(self, blogs: list) -> Dict[str, Any]:
        """Sync blog posts to chatbot service"""
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/sync/blogs",
                json={"posts": blogs, "action": "create"},
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Failed to sync blogs: {str(e)}"}

    def sync_wordpress_blog_posts(self, page: int = 1, per_page: int = 25) -> Dict[str, Any]:
        """Ask chatbot service to fetch and sync blog posts from WordPress."""
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/sync/wordpress-blogs",
                json={"page": page, "per_page": per_page},
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Failed to sync WordPress blogs: {str(e)}"}

    def sync_content_resources(self, resources: list) -> Dict[str, Any]:
        """Sync recommendable content resources to chatbot service."""
        path = os.getenv("CHATBOT_CONTENT_SYNC_PATH", "/api/v1/sync/content")
        try:
            response = requests.post(
                f"{self.base_url}{path}",
                json={"resources": resources, "action": "upsert"},
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": f"Failed to sync content resources: {str(e)}"}

    def sync_blog_post(self, blog, url: Optional[str] = None) -> Dict[str, Any]:
        """Sync a single backend BlogPost-like object to chatbot service."""
        source_id = getattr(blog, "wp_post_id", None) or blog.id
        source = getattr(blog, "source", None) or "local"
        resource_prefix = "wordpress_blog" if source == "wordpress" else "blog"
        blog_data = {
            "id": blog.id,
            "source_id": source_id,
            "resource_id": f"{resource_prefix}:{source_id}",
            "source": source,
            "type": "blog",
            "title": blog.title,
            "content": blog.content,
            "summary": getattr(blog, "summary", None),
            "author": blog.author.username if getattr(blog, "author", None) else "YesLove",
            "timestamp": blog.timestamp.isoformat() if getattr(blog, "timestamp", None) else None,
            "published_at": blog.timestamp.isoformat() if getattr(blog, "timestamp", None) else None,
            "url": url or getattr(blog, "link", None),
            "image_url": getattr(blog, "image_url", None),
        }
        return self.sync_blog_posts([blog_data])

    def sync_video_podcast(self, video, url: Optional[str] = None) -> Dict[str, Any]:
        """Sync a single video podcast as a recommendable chatbot resource."""
        searchable_content = "\n\n".join(
            value for value in [
                getattr(video, "description", None),
                getattr(video, "transcript", None),
            ] if value
        )
        resource = {
            "id": f"video_podcast:{video.id}",
            "source_id": video.id,
            "type": "video_podcast",
            "title": video.title,
            "summary": getattr(video, "description", None),
            "content": searchable_content,
            "transcript": getattr(video, "transcript", None),
            "url": url or getattr(video, "video_url", None),
            "video_url": getattr(video, "video_url", None),
            "thumbnail_url": getattr(video, "thumbnail_url", None),
            "tags": video.tag_list() if hasattr(video, "tag_list") else [],
            "author": video.author.username if getattr(video, "author", None) else "YesLove",
            "published_at": video.published_at.isoformat() if getattr(video, "published_at", None) else None,
        }
        return self.sync_content_resources([resource])

    def health_check(self) -> Dict[str, Any]:
        """Check chatbot service health"""
        try:
            response = requests.get(f"{self.base_url}/api/v1/health", timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"status": "unhealthy", "error": str(e)}
