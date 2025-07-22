from .chatbot_routes import api
from flask_restx import fields

MessageRequest = api.model("MessageRequest", {
        "message": fields.String(required=True, description="Message content")
    })