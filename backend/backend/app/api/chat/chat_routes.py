from flask import request
from flask_restx import Namespace, Resource

from app.logging_setup import logger

from app.utils import require_auth



api = Namespace("chat", description="API Endpoints")

@api.route("/send_message")
class SendMessage(Resource):
    from .chat_models import SendMessageRequest
    @require_auth() 
    @api.expect(SendMessageRequest)  # ✅ Attach model
    def post(self):
        """Send a private message."""
        from app.models import User, Chat, db
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        data = request.json
        receiver_id = data.get("receiver_id")
        message = data.get("message")

        if not message or not receiver_id:
            logger.error("❌ Message content or receiver ID missing")
            return {"message": "Message and receiver ID are required"}, 400

        if user.id == receiver_id:
            logger.warning(f"❌ User {user.username} tried to message themselves")
            return {"message": "You cannot message yourself"}, 400

        receiver = User.query.get(receiver_id)
        if not receiver:
            logger.warning(f"❌ Receiver ID {receiver_id} not found")
            return {"message": "Receiver not found"}, 404

        new_message = Chat(sender_id=user.id, receiver_id=receiver_id, message=message)
        db.session.add(new_message)
        db.session.commit()
        logger.info(f"✅ Message sent from {user.username} to {receiver.username}")
        return {"message": "Message sent successfully"}, 201


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