from .chat_routes import api
from flask_restx import fields

SendMessageRequest = api.model("SendMessageRequest", {
        "receiver_id": fields.Integer(required=True, description="ID of the recipient user"),
        "message": fields.String(required=True, description="Message content")
    })

GetMessagesRequest = api.model("GetMessagesRequest", {})
