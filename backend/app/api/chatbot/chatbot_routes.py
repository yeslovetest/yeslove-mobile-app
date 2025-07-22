from flask import request, current_app
from flask_restx import Namespace, Resource
from app.utils import require_auth
from app.logging_setup import logger

api = Namespace("chatbot", description="API Endpoints")

@api.route("/message")
class SendMessage(Resource):
    from .chatbot_models import MessageRequest

    @require_auth() 
    @api.expect(MessageRequest)
    def post(self):
        """Send a message to chatbot."""
        from app.models import User
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        data = request.json  # <-- always executed

        if not user:
            # return {"message": "User not found"}, 404
            pass  # or handle accordingly

        user_message = data.get("message", "")
        history = data.get("history", [])

        response = str(current_app.chatbot.chat(user_message, history))
        return {"response": response}, 200
