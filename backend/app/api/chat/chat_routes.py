from datetime import date, timedelta
from flask import request
from flask_restx import Namespace, Resource, reqparse
from sqlalchemy import func, or_, and_
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.datastructures import FileStorage
from app.utils.moderation_utils import handle_content_moderation, check_user_suspension

from app.logging_setup import setup_logger

from app.utils import require_auth

logger = setup_logger()

api = Namespace("chat", description="API Endpoints")

@api.route("/upload_media")
class UploadChatMedia(Resource):
    from .chat_models import UploadChatMediaResponse
    @require_auth()
    @api.doc(description="Upload media file for chat message", security='Bearer')
    @api.expect(api.parser().add_argument('file', location='files', type='file', required=True, help='Media file to upload'))
    @api.response(201, 'Media uploaded successfully', UploadChatMediaResponse)
    @api.response(400, 'Bad request - invalid file')
    @api.response(404, 'User not found')
    def post(self):
        """Upload media file for chat."""
        from app.models import User
        from app.services.media.media_service import MediaService
        
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404
            
        if 'file' not in request.files:
            return {"message": "No file provided"}, 400
            
        file = request.files['file']
        if not file.filename:
            return {"message": "No file selected"}, 400
            
        try:
            result = MediaService.store_file(file=file, user_id=user.id)
            return {
                "media_id": result.get("media_id"),
                "media_url": result.get("media_url"),
                "content_type": result.get("content_type")
            }, 201
        except Exception as e:
            logger.error(f"Chat media upload failed: {e}")
            return {"message": "Upload failed"}, 500

@api.route("/send_message")
class SendMessage(Resource):
    from .chat_models import SendMessageRequest
    send_message_parser = api.parser()
    send_message_parser.add_argument(
        "receiver_id",
        type=str,
        location="form",
        required=True,
        help="keycloak ID of the recipient user"
    )
    send_message_parser.add_argument(
        "message",
        type=str,
        location="form",
        required=False,
        help="Message content (required if no media)"
    )
    send_message_parser.add_argument(
        "media",
        type=FileStorage,
        location="files",
        required=False,
        action="append",
        help="One or more media files"
    )

    @require_auth() 
    @api.doc(
        description="Send a message with optional media files in the same request. Use multipart/form-data with receiver_id, optional message, and optional media files."
    )
    @api.expect(send_message_parser)  # Accept multipart/form-data payload
    @api.response(201, 'Message sent successfully')
    @api.response(400, 'Bad request - missing message/media or invalid receiver')
    @api.response(404, 'User not found')
    @api.response(401, 'Unauthorized')
    def post(self):
        """Send a private message with moderation."""
        from app.models import User, Chat, db
        from app.services.media.media_service import MediaService


        data = request.get_json(silent=True) or {}

        if request.content_type and "multipart/form-data" in request.content_type.lower():
            receiver_id = (request.form.get("receiver_id") or "").strip()
            raw_message = request.form.get("message")
            uploaded_files = request.files.getlist("media") or request.files.getlist("file")
            media_files = [file for file in uploaded_files if getattr(file, "filename", "")]
            media_ids = []
        else:
            receiver_id = data.get("receiver_id")
            raw_message = data.get("message")
            media_files = []
            raw_media_id = data.get("media_id")
            if isinstance(raw_media_id, list):
                media_ids = [str(item).strip() for item in raw_media_id if str(item).strip()]
            elif isinstance(raw_media_id, str) and raw_media_id.strip():
                media_ids = [raw_media_id.strip()]
            else:
                media_ids = []

        message = raw_message.strip() if isinstance(raw_message, str) else ""
        has_media = len(media_ids) > 0 or len(media_files) > 0

        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()

        if not user:
            return {"message": "User not found"}, 404

        if not receiver_id:
            logger.error("❌ Receiver ID missing")
            return {"message": "Receiver ID is required"}, 400

        if not message and not has_media:
            logger.error("❌ Message content/media or receiver ID missing")
            return {"message": "Message or media and receiver ID are required"}, 400

        if user.keycloak_id == receiver_id:
            logger.warning(f"❌ User {user.username} tried to message themselves")
            return {"message": "You cannot message yourself"}, 400

        receiver = User.query.filter_by(keycloak_id=receiver_id).first()

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

        # Store files in the same request flow so clients can send text + media in one API call.
        if media_files:
            for media_file in media_files:
                try:
                    result = MediaService.store_file(file=media_file, user_id=user.id, auto_commit=False)
                    media_ref = result.get("media_id")
                    if media_ref:
                        media_ids.append(str(media_ref))
                except Exception as e:
                    file_name = getattr(media_file, "filename", "unknown-file")
                    logger.error(f"Chat media upload failed for {file_name}: {e}")
                    db.session.rollback()
                    return {"message": "Upload failed"}, 400

        # If only media was sent but no valid media IDs were stored, fail fast.
        if not message and not media_ids:
            db.session.rollback()
            return {"message": "No valid media uploaded"}, 400

        # ✅ Save the message (even if flagged)
        #new_message = Chat(sender_id=user.id, receiver_id=receiver_id, message=message)
        try:
            if media_ids:
                for media_ref in media_ids:
                    new_message = Chat(sender_id=user.id, receiver_id=receiver.id, message=message, media_id=media_ref)
                    db.session.add(new_message)
            else:
                new_message = Chat(sender_id=user.id, receiver_id=receiver.id, message=message)
                db.session.add(new_message)
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Chat message commit failed: {e}")
            return {"message": "Failed to save message"}, 500

        # Send realtime message and optional push delivery.
        from app.services.push_notification_service import PushNotificationService
        from flask import current_app
        
        message_data = {
            "id": new_message.id,
            "sender": user.username,
            "sender_id": user.id,
            "content": message,
            "media_id": media_ids,
            "timestamp": new_message.timestamp.isoformat()
        }
        
        try:
            # Send realtime message via WebSocket
            if hasattr(current_app, 'websocket_service'):
                is_online = current_app.websocket_service.send_message_realtime(receiver.id, message_data)
                if not is_online:
                    # User offline, send push notification
                    PushNotificationService.send_to_user(
                        user_id=receiver.id,
                        title="New Message",
                        body=f"{user.username}: {message[:50]}..." if message else f"{user.username} sent you a message",
                        data={"type": "message", "sender_id": user.id, "chat_id": new_message.id},
                        notification_type="messages",
                        persist_in_db=False,
                    )
            
        except Exception as e:
            logger.error(f"Realtime/notification failed for message {new_message.id}: {e}")

        response_msg = "Message sent successfully"
        score = 0.0
        
        if moderation_result:
            score = moderation_result["score"]
            if moderation_result["status"] == "flagged":
                response_msg += " (flagged for review)"

        return {
            "message": response_msg,
            "toxicity_score": score,
            "message_data": message_data
        }, 201


@api.route("/get_messages/<string:receiver_id>")
class GetMessages(Resource):
    
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
            media_url = None
            media_type = None
            if msg.media:
                media_url = msg.media.s3_url or (f"/api/media/{msg.media_id}" if msg.media_id else None)
                media_type = msg.media.content_type
            elif msg.media_id:
                # Fallback when relationship is missing but media_id exists.
                media_url = f"/api/media/{msg.media_id}"

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
    @api.response(code=200, description="List of friends with last message", model=GetFriendsResponse)
    @api.response(404, "User not found")
    @api.response(code=404, description="User not found")
    def get(self, keycloak_id):
        """
        Fetch all confirmed friends of the current user along with
        their last message and timestamp.

        This endpoint returns only mutual friend relationships
        (friend follow exists in both directions).
        Each entry includes:
        - Friend’s username and profile picture
        - Last message exchanged
        - Timestamp of the last message
        """
        from app.models import Follow, User, Chat, db
        from sqlalchemy.orm import aliased
        

        # Get current user
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        if keycloak_id != user.keycloak_id:
            return {"message": "Forbidden"}, 403

        outgoing_friend = aliased(Follow)
        incoming_friend = aliased(Follow)

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
                outgoing_friend,
                and_(
                    outgoing_friend.follower_id == user.id,
                    outgoing_friend.followed_id == User.id,
                    outgoing_friend.follow_type == "friend",
                )
            )
            .join(
                incoming_friend,
                and_(
                    incoming_friend.follower_id == User.id,
                    incoming_friend.followed_id == user.id,
                    incoming_friend.follow_type == "friend",
                )
            )
            .filter(User.id != user.id)
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

        