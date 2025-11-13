import os
import requests
from typing import Dict, Any, Optional

class ChatbotClient:
    def __init__(self):
        self.base_url = os.getenv("CHATBOT_SERVICE_URL", "http://localhost:8000")
        self.timeout = 30

    def send_message(self, message: str, user_id: int, history: list = None, session_id: str = None) -> Dict[str, Any]:
        """Send message to chatbot service"""
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/chat/message",
                json={
                    "message": message,
                    "user_id": user_id,
                    "history": history or [],
                    "session_id": session_id
                },
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

    def health_check(self) -> Dict[str, Any]:
        """Check chatbot service health"""
        try:
            response = requests.get(f"{self.base_url}/api/v1/health", timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"status": "unhealthy", "error": str(e)}