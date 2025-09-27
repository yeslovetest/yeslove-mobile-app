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
        "opened": fields.Boolean(description="Whether the message has been opened"),
        "timestamp": fields.String(description="Timestamp of the message ISO format")})

GetMessagesResponse = api.model("GetMessagesResponse", {
        "messages": fields.List(fields.Nested(Chat), description="List of chat messages")})

MarkChatOpenedResponse = api.model(
    "MarkChatOpenedResponse",
    {
        "message": fields.String(
            description="Confirmation message with number of messages opened",
            example="3 messages marked as opened"
        )
    },
)


GetFriendsRequest = api.model(
    "GetFriendsRequest",
    {
        "keycloak_id": fields.String(required=True, description="The Keycloak ID of the current user")
    },
)

FriendInfo = api.model(
    "FriendInfo",
    {
        "id": fields.String(description="Keycloak ID of the friend"),
        "username": fields.String(description="Friend's username"),
        "profile_pic": fields.String(description="URL to profile picture"),
        "last_message": fields.String(description="Snippet of the last message"),
        "last_message_time": fields.String(description="Timestamp of last message (ISO 8601 format)"),
        "unread": fields.Boolean(description="True if last message is from friend and not opened, otherwise False"),
    },
)

GetFriendsResponse = api.model(
    "GetFriendsResponse",
    {
        "friends": fields.List(fields.Nested(FriendInfo), description="List of friends with chat preview")
    },
)

