from .chatbot_routes import api
from flask_restx import fields

MessageRequest = api.model("MessageRequest", {
        "message": fields.String(required=True, description="Message content"),
        "history": fields.List(fields.Raw, required=False, description="Prior conversation messages"),
        "session_id": fields.String(required=False, description="Conversation session ID")
    })
