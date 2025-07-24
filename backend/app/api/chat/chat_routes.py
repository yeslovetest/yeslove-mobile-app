from flask import request
from flask_restx import Namespace, Resource
from app.utils.perspective_api import moderate_text
from app.utils.moderation_utils import process_moderation

from app.logging_setup import logger

from app.utils import require_auth
from app.models import ModerationLog
from datetime import datetime



api = Namespace("chat", description="API Endpoints")

@api.route("/send_message")
class SendMessage(Resource):
    from .chat_models import SendMessageRequest

    @require_auth()
    @api.expect(SendMessageRequest)
    def post(self):
        """Send a private message with moderation, spam check, and rate limiting."""
        from app.models import User, Chat, ModerationLog, db
        from datetime import datetime
        import os
        from app.utils.moderation_utils import process_moderation, is_spammy_content, is_posting_too_fast

        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        data = request.json
        receiver_id = data.get("receiver_id")
        message = data.get("message")

        if not message or not receiver_id:
            return {"message": "Message and receiver ID are required"}, 400

        if user.id == receiver_id:
            return {"message": "You cannot message yourself"}, 400

        receiver = User.query.get(receiver_id)
        if not receiver:
            return {"message": "Receiver not found"}, 404

        # ✅ Spam detection
        if os.getenv("ENABLE_SPAM_FILTER", "false").lower() == "true":
            if is_spammy_content(message):
                return {"message": "Message flagged as spam"}, 400

        # ✅ Rate-limiting
        if os.getenv("ENABLE_RATE_LIMIT_CHECK", "false").lower() == "true":
            if is_posting_too_fast(user):
                return {"message": "You’re sending messages too fast. Please wait."}, 400

        # ✅ Moderate message
        status, score, log = process_moderation(message, user, content_type="chat")

        if log:
            db.session.add(log)
            if log.severity == "high":
                db.session.commit()
                return {
                    "message": "Your message was blocked due to harmful language.",
                    "toxicity_score": score,
                    "triggered": list(log.attributes.keys())
                }, 400

        # ✅ Save the message (even if flagged)
        new_message = Chat(sender_id=user.id, receiver_id=receiver_id, message=message)
        db.session.add(new_message)
        db.session.commit()

        response_msg = "Message sent successfully"
        if status == "flagged":
            response_msg += " (flagged for review)"

        return {
            "message": response_msg,
            "toxicity_score": score
        }, 201



@api.route("/get_messages/<int:receiver_id>")
class GetMessages(Resource):
    from .chat_models import GetMessagesRequest
    @require_auth()
    @api.expect(GetMessagesRequest)  # ✅ Attach model
    def get(self, receiver_id):
        """Fetch chat messages between two users."""
        from app.models import User, Chat
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        messages = Chat.query.filter(
            ((Chat.sender_id == user.id) & (Chat.receiver_id == receiver_id))
            | ((Chat.sender_id == receiver_id) & (Chat.receiver_id == user.id))
        ).order_by(Chat.timestamp.asc()).all()

        return [
            {
                "sender": msg.sender.username,
                "receiver": msg.receiver.username,
                "message": msg.message,
                "timestamp": msg.timestamp.isoformat(),
            }
            for msg in messages
        ], 200