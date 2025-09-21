from .chat_routes import api
from flask_restx import fields

SendMessageRequest = api.model("SendMessageRequest", {
        "receiver_id": fields.String(required=True, description="keycloak ID of the recipient user"),
        "message": fields.String(required=True, description="Message content")
    })

GetMessagesRequest = api.model("GetMessagesRequest", {})

Chat = api.model("Chat", {
        "sender": fields.String(description="Sender Username"),
        "receiver": fields.String(description="Receiver Username"),
        "content": fields.String(description="Message content"),
        "timestamp": fields.String(description="Timestamp of the message ISO format")})

GetMessagesResponse = api.model("GetMessagesResponse", {
        "messages": fields.List(fields.Nested(Chat), description="List of chat messages")})
