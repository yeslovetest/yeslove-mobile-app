from flask_socketio import SocketIO, emit, join_room, leave_room
from app.logging_setup import setup_logger

logger = setup_logger()

class WebSocketService:
    def __init__(self, socketio):
        self.socketio = socketio
        self.active_users = {}  # {user_id: socket_id}
        
    def handle_connect(self, user_id):
        """User connects to WebSocket"""
        self.active_users[user_id] = request.sid
        join_room(f"user_{user_id}")
        logger.info(f"User {user_id} connected")
        
    def handle_disconnect(self, user_id):
        """User disconnects from WebSocket"""
        if user_id in self.active_users:
            del self.active_users[user_id]
        leave_room(f"user_{user_id}")
        logger.info(f"User {user_id} disconnected")
        
    def send_message_realtime(self, receiver_id, message_data):
        """Send message to user in realtime"""
        if receiver_id in self.active_users:
            self.socketio.emit('new_message', message_data, room=f"user_{receiver_id}")
            return True
        return False
        
    def is_user_online(self, user_id):
        """Check if user is online"""
        return user_id in self.active_users