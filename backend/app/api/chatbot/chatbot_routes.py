from flask import request
from flask_restx import Namespace, Resource
from app.utils import require_auth
from app.logging_setup import setup_logger
from app.services.chatbot_client import ChatbotClient

logger = setup_logger()
api = Namespace("chatbot", description="API Endpoints")
chatbot_client = ChatbotClient()

@api.route("/message")
class SendChatbotMessage(Resource):
    from .chatbot_models import MessageRequest
    @require_auth()
    @api.expect(MessageRequest)
    def post(self):
        """Send a message to chatbot microservice."""
        from app.models import User
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        data = request.json

        if not user:
            return {"message": "User not found"}, 404

        user_message = data.get("message", "")
        history = data.get("history", [])
        session_id = data.get("session_id")

        result = chatbot_client.send_message(
            user_message,
            user.id,
            history,
            session_id,
            auth_token=request.headers.get("Authorization"),
        )
        
        if "error" in result:
            return {"error": result["error"]}, 503
            
        return result, 200
