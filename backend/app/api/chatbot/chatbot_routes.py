from flask import request, current_app
from flask_restx import Namespace, Resource
from app.utils import require_auth
from app.logging_setup import setup_logger

# create a logger instance 
logger = setup_logger()

api = Namespace("chatbot", description="API Endpoints")

@api.route("/message")
class SendChatbotMessage(Resource):
    from .chatbot_models import MessageRequest
    # all commented lines is to allow testing API without having to login
    #@require_auth()  
    @api.expect(MessageRequest)
    def post(self):
        """Send a message to chatbot."""
        from app.models import User
        #user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        data = request.json  # <-- always executed

        #if not user:
            #return {"message": "User not found"}, 404
            #pass

        user_message = data.get("message", "")
        history = data.get("history", [])

        response = str(current_app.chatbot.chat(user_message, history))
        return {"response": response}, 200
