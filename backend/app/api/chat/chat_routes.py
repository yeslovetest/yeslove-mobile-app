from datetime import date
from flask import request
from flask_restx import Namespace, Resource
from sqlalchemy import func, or_, and_
from app.utils.moderation_utils import handle_content_moderation, check_user_suspension

from app.logging_setup import setup_logger

from app.utils import require_auth

logger = setup_logger()

api = Namespace("chat", description="API Endpoints")

@api.route("/send_message")
class SendMessage(Resource):
    from .chat_models import SendMessageRequest
    @require_auth() 
    @api.doc(
        description="Send a message with optional media attachment. Either message or media_id must be provided."
    )
    @api.expect(SendMessageRequest)  # ✅ Attach model
    @api.response(201, 'Message sent successfully')
    @api.response(400, 'Bad request - missing message/media or invalid receiver')
    @api.response(404, 'User not found')
    @api.response(401, 'Unauthorized')
    def post(self):
        """Send a private message with moderation."""
        from app.models import User, Chat, ModerationLog, db
        from datetime import datetime


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
        if (not message and not data.get("media_id")) or not receiver_id:
            logger.error("❌ Message content/media or receiver ID missing")
            return {"message": "Message or media and receiver ID are required"}, 400

        if user.keycloak_id == receiver_id:
            logger.warning(f"❌ User {user.username} tried to message themselves")
            return {"message": "You cannot message yourself"}, 400

        if not receiver:
            logger.warning(f"❌ Receiver ID {receiver_id} not found")
            return {"message": "Receiver not found"}, 404

        # Check if user is suspended
        if check_user_suspension(user.id):
            return {"message": "Account suspended. Cannot send messages."}, 403

        # Moderate content if message exists
        moderation_result = None
        if message:
            moderation_result = handle_content_moderation(message, user.id, "chat")
            
            if moderation_result["status"] == "error":
                return {"message": moderation_result["message"]}, 500
            
            if not moderation_result["allowed"]:
                db.session.commit()  # Save moderation log
                return {
                    "message": moderation_result["message"],
                    "toxicity_score": moderation_result["score"],
                    "triggered": moderation_result.get("triggered", {})
                }, 400

        # ✅ Save the message (even if flagged)
        #new_message = Chat(sender_id=user.id, receiver_id=receiver_id, message=message)
        media_id = data.get("media_id")
        new_message = Chat(sender_id=user.id, receiver_id=receiver.id, message=message, media_id=media_id)
        db.session.add(new_message)
        db.session.commit()

        response_msg = "Message sent successfully"
        score = 0.0
        
        if moderation_result:
            score = moderation_result["score"]
            if moderation_result["status"] == "flagged":
                response_msg += " (flagged for review)"

        return {
            "message": response_msg,
            "toxicity_score": score
        }, 201


@api.route("/get_messages/<string:receiver_id>")
class GetMessages(Resource):
    from datetime import timedelta
    from .chat_models import GetMessagesRequest, GetMessagesResponse

    @require_auth()
    @api.doc(
        description="Fetch chat messages between current user and specified receiver, combining media with same caption if sent within 10 seconds",
        params={'receiver_id': 'Keycloak ID of the message recipient'}
    )
    @api.response(200, 'Success', GetMessagesResponse)
    @api.response(404, 'User not found')
    @api.response(401, 'Unauthorized')
    def get(self, receiver_id):
        """Fetch chat messages between two users, grouped by caption and sender (within 10s)."""
        from app.models import User, Chat

        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        receiver = User.query.filter_by(keycloak_id=receiver_id).first()

        if not user or not receiver:
            return {"message": "User not found"}, 404

        # Fetch all messages between users
        messages = Chat.query.filter(
            ((Chat.sender_id == user.id) & (Chat.receiver_id == receiver.id))
            | ((Chat.sender_id == receiver.id) & (Chat.receiver_id == user.id))
        ).order_by(Chat.timestamp.asc()).all()

        grouped_msgs = []
        current_group = None

        for msg in messages:
            media_url = f"/api/media/{msg.media_id}" if msg.media_id else None
            media_type = msg.media.content_type if msg.media else None
            sender = msg.sender.username
            receiver_name = msg.receiver.username
            content = msg.message
            timestamp = msg.timestamp

            # If starting new group or conditions don’t match, start fresh
            if (
                current_group is None
                or current_group["sender"] != sender
                or current_group["content"] != content
                or (timestamp - current_group["last_timestamp"]) > timedelta(seconds=10)
            ):
                # Push previous group
                if current_group:
                    grouped_msgs.append(current_group)

                # Start new group
                current_group = {
                    "sender": sender,
                    "receiver": receiver_name,
                    "content": content,
                    "media": [{'uri': media_url, 'type': media_type}] if media_url else [],
                    "opened": msg.opened,
                    "timestamp": timestamp.isoformat(),
                    "last_timestamp": timestamp,  # track last timestamp for comparison
                }
            else:
                # Same group — add media and update last timestamp
                if media_url:
                    current_group["media"].append({'uri': media_url, 'type': media_type})
                current_group["last_timestamp"] = timestamp

        # Append final group
        if current_group:
            grouped_msgs.append(current_group)

        # Remove the internal tracking key before returning
        for g in grouped_msgs:
            g.pop("last_timestamp", None)

        return {"messages": grouped_msgs}, 200



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
    @api.doc(
        params={
            'keycloak_id': 'Keycloak ID of the current user'
        }
    )
    @api.response(200, "List of friends with last message")
    @api.response(404, "User not found")
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
                User.profile_pic_url,
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
                    "profile_pic": f.profile_pic_url,
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

        