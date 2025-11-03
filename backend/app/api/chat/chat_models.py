from .chat_routes import api
from flask_restx import fields

SendMessageRequest = api.model("SendMessageRequest", {
        "receiver_id": fields.String(required=True, description="keycloak ID of the recipient user"),
        "message": fields.String(required=False, description="Message content (required if no media_id)"),
        "media_id": fields.String(required=False, description="Media ID for attachments (required if no message)")
    })

SendMessageResponse = api.model("SendMessageResponse", {
        "message": fields.String(description="Success confirmation message")
    })

GetMessagesRequest = api.model("GetMessagesRequest", {})

Chat = api.model("Chat", {
        "sender": fields.String(description="Sender Username"),
        "receiver": fields.String(description="Receiver Username"),
        "content": fields.String(description="Message content"),
        "media": fields.List(fields.Nested(api.model("MediaFile", {
            "uri": fields.String(description="URL of the media file"),  
            "type": fields.String(description="Type of the media file: 'image', 'video', etc.")
        })), description="List of media files associated with the message"),
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

