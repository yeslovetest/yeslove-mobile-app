from datetime import date
from flask import request
from flask_restx import Namespace, Resource
from sqlalchemy import func, or_, and_

from app.logging_setup import setup_logger

from app.utils import require_auth

logger = setup_logger()

api = Namespace("chat", description="API Endpoints")

@api.route("/send_message")
class SendMessage(Resource):
    from .chat_models import SendMessageRequest
    @require_auth() 
    @api.expect(SendMessageRequest)  # ✅ Attach model
    def post(self):
        """Send a private message."""
        from app.models import User, Chat, db
        data = request.json
        receiver_id = data.get("receiver_id")
        message = data.get("message")

        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        receiver = User.query.filter_by(keycloak_id=receiver_id).first()

        if not user:
            return {"message": "User not found"}, 404

        if not message or not receiver_id:
            logger.error("❌ Message content or receiver ID missing")
            return {"message": "Message and receiver ID are required"}, 400

        if user.keycloak_id == receiver_id:
            logger.warning(f"❌ User {user.username} tried to message themselves")
            return {"message": "You cannot message yourself"}, 400

        if not receiver:
            logger.warning(f"❌ Receiver ID {receiver_id} not found")
            return {"message": "Receiver not found"}, 404

        new_message = Chat(sender_id=user.id, receiver_id=receiver.id, message=message)
        db.session.add(new_message)
        db.session.commit()
        logger.info(f"✅ Message sent from {user.username} to {receiver.username}")
        return {"message": "Message sent successfully"}, 201


@api.route("/get_messages/<string:receiver_id>")
class GetMessages(Resource):
    from .chat_models import GetMessagesRequest, GetMessagesResponse
    @require_auth()
    @api.expect(GetMessagesRequest)  # ✅ Attach model
    @api.response(200, 'Success', GetMessagesResponse) 
    def get(self, receiver_id):
        """Fetch chat messages between two users."""
        from app.models import User, Chat
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        receiver = User.query.filter_by(keycloak_id=receiver_id).first()

        if not user or not receiver:
            return {"message": "User not found"}, 404

        messages = Chat.query.filter(
            ((Chat.sender_id == user.id) & (Chat.receiver_id == receiver.id))
            | ((Chat.sender_id == receiver.id) & (Chat.receiver_id == user.id))
        ).order_by(Chat.timestamp.asc()).all()

        return {"messages": [
            {
                "sender": msg.sender.username,
                "receiver": msg.receiver.username,
                "content": msg.message,
                "opened": msg.opened,
                "timestamp": msg.timestamp.isoformat(),
            }
            for msg in messages
        ]}, 200


@api.route("/mark_chat_opened/<string:receiver_id>")
class MarkChatOpened(Resource):
    from .chat_models import MarkChatOpenedResponse
    @require_auth()
    @api.doc(
        description="Mark all unread messages in a chat as opened when the current user opens the conversation.",
        params={
            "receiver_id": "The Keycloak ID of the user on the other end of the chat"
        }
    )
    @api.response(200, "Messages successfully marked as opened", MarkChatOpenedResponse)
    @api.response(404, "User not found")
    def put(self, receiver_id):
        """
        Mark all messages in the chat as opened.

        When the authenticated user opens the chat with another user,
        all messages sent by the other user to them that are currently
        unopened will be marked as opened.
        """
        from app.models import User, Chat, db

        # Find the current user (from Keycloak token)
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        receiver = User.query.filter_by(keycloak_id=receiver_id).first()

        if not user or not receiver:
            return {"message": "User not found"}, 404

        # ✅ Bulk update: mark all unread messages from the receiver as opened
        updated_count = Chat.query.filter(
            (Chat.sender_id == receiver.id) &
            (Chat.receiver_id == user.id) &
            (Chat.opened == False)
        ).update({"opened": True}, synchronize_session=False)

        db.session.commit()

        logger.info(
            f"✅ {updated_count} messages from {receiver.username} marked as opened by {user.username}"
        )
        return {"message": f"{updated_count} messages marked as opened"}, 200


@api.route("/friends/<string:keycloak_id>")
class GetFriends(Resource):
    from .chat_models import GetFriendsRequest, GetFriendsResponse

    @require_auth()
    @api.expect(GetFriendsRequest)  # ✅ Attach request model
    @api.response(code=200, description="List of friends with last message", model=GetFriendsResponse)
    @api.response(code=404, description="User not found")
    def get(self, keycloak_id):
        """
        Fetch all friends of the current user along with
        their last message and timestamp.
        
        This endpoint returns a list of users where the follow type is "friend".
        Each entry includes:
        - Friend’s username and profile picture
        - Last message exchanged
        - Timestamp of the last message
        """
        from app.models import Follow, User, Chat, db
        

        # Get current user
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        # Subquery: find last message timestamp for each conversation
        last_message_subq = (
            db.session.query(
                func.max(Chat.timestamp).label("last_timestamp"),
                func.least(Chat.sender_id, Chat.receiver_id).label("u1"),
                func.greatest(Chat.sender_id, Chat.receiver_id).label("u2"),
            )
            .group_by(
                func.least(Chat.sender_id, Chat.receiver_id),
                func.greatest(Chat.sender_id, Chat.receiver_id)
            )
            .subquery()
        )


        # Query friends + last message
        friends_with_last_message = (
            db.session.query(
                User.id.label("friend_id"),
                User.keycloak_id,
                User.username,
                User.profile_pic,
                Chat.message,
                Chat.timestamp,
                Chat.opened,
                Chat.sender_id
            )
            .join(
                Follow,
                or_(
                    Follow.follower_id == User.id,
                    Follow.followed_id == User.id
                )
            )
            .filter(Follow.follow_type == "friend")
            .filter(or_(
                Follow.follower_id == user.id,
                Follow.followed_id == user.id
            )).filter(User.id != user.id)
            .outerjoin(
                last_message_subq,
                and_(
                    func.least(User.id, user.id) == last_message_subq.c.u1,
                    func.greatest(User.id, user.id) == last_message_subq.c.u2
                )
            )
            .outerjoin(
                Chat,
                and_(
                    Chat.timestamp == last_message_subq.c.last_timestamp,
                    or_(
                        (Chat.sender_id == user.id) & (Chat.receiver_id == User.id),
                        (Chat.sender_id == User.id) & (Chat.receiver_id == user.id)
                    )
                )
            )
            .distinct(User.id)
            .all()
        )   

        return {
            "friends": [
                {
                    "id": f.keycloak_id,
                    "username": f.username,
                    "profile_pic": f.profile_pic,
                    "last_message": f.message[:60] if f.message else '',
                    "last_message_time": f.timestamp.isoformat() if f.timestamp else date.today().isoformat(),
                    "unread": (
                        False if f.sender_id is None 
                        else ((f.sender_id != user.id) and (not f.opened))
                    )
                }
                for f in friends_with_last_message
            ]
        }, 200

        