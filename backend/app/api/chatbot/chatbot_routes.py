from flask import request, current_app
from flask_restx import Namespace, Resource
from app.utils import require_auth

api = Namespace("chatbot", description="API Endpoints")

@api.route("/message")
class SendMessage(Resource):
    from .chatbot_models import MessageRequest
    
    @require_auth() 
    @api.expect(MessageRequest)  # ✅ Attach model
    def post(self):
        """Send a message to chatbot."""
        from app.models import User
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        data = request.json
        user_message = data.get("message", "")
        history = data.get("history", [])
        response = str(current_app.chatbot.chat(user_message, history))
        return {"response": response}, 200



