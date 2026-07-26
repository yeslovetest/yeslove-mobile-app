from flask import request, jsonify
from flask_restx import Namespace, Resource, fields
from app.core.rag_engine import RAGEngine
from app.utils.auth import require_auth
from app.services.history_service import (
    get_session_history,
    save_message,
    user_owns_session,
)

api = Namespace("chat", description="Chat API with Priority-Based RAG")

chat_request = api.model('ChatRequest', {
    'message': fields.String(required=True, description='User message', example='How do I build trust in a relationship?'),
    'session_id': fields.String(description='Chat session ID', example='session-123'),
    'user_id': fields.Integer(description='User ID', example=1),
    'history': fields.List(fields.Raw, description='Previous chat messages')
})

chat_response = api.model('ChatResponse', {
    'response': fields.String(description='AI-generated response with source attribution'),
    'session_id': fields.String(description='Chat session ID'),
    'user_id': fields.String(description='Authenticated user ID'),
    'sources': fields.String(description='Source attribution for transparency')
})

# Initialize RAG engine lazily
rag_engine = None

def get_rag_engine():
    global rag_engine
    if rag_engine is None:
        rag_engine = RAGEngine()
    return rag_engine

@api.route('/message')
class ChatMessage(Resource):
    @require_auth
    @api.expect(chat_request)
    @api.marshal_with(chat_response)
    @api.doc(responses={
        200: 'Success',
        400: 'Bad Request - Missing message',
        401: 'Unauthorized - Authentication required',
        500: 'Internal Server Error'
    })
    def post(self):
        """Send message to chatbot with priority-based RAG retrieval
        
        **Authentication Required**: Bearer token from YesLove app login
        
        Features:
        - User authentication via JWT token
        - Priority-based source retrieval (YesLove → Core → Abuse → Youth → Cultural → Contextual)
        - Crisis detection for abuse/harm queries
        - Source attribution in responses
        - 23 approved relationship advice sources
        - User-specific session management
        """
        data = request.json
        
        if not data or not data.get('message'):
            return {'error': 'Message is required'}, 400
            
        message = data.get('message', '')
        history = data.get('history', [])
        session_id = data.get('session_id', 'default')
        
        try:
            # Use authenticated user ID for session management
            user_id = getattr(request, 'user_id', 'anonymous')
            if session_id == 'default':
                session_id = f"user_{user_id}_{hash(message) % 10000}"

            # Load prior conversation for this session (server is the source
            # of truth). Falls back to client-sent history if none is stored.
            stored_history = get_session_history(session_id)
            if stored_history:
                history = stored_history

            response = get_rag_engine().generate_response(message, history)

            # Persist this turn so the next message remembers it. This is
            # safe: save_message never raises, so it can't break the reply.
            save_message(session_id, user_id, message, response)

            return {
                'response': response,
                'session_id': session_id,
                'user_id': user_id,
                'sources': 'Multiple credible relationship advice sources'
            }
        except Exception as e:
            return {'error': str(e)}, 500


@api.route('/history/<string:session_id>')
class ChatHistoryResource(Resource):
    @require_auth
    @api.doc(responses={
        200: 'Success',
        401: 'Unauthorized - Authentication required',
        403: 'Forbidden - Session belongs to another user',
    })
    def get(self, session_id):
        """Return the stored conversation for one of the caller's own sessions."""
        user_id = getattr(request, 'user_id', 'anonymous')

        # Privacy: a user may only read their own conversation history.
        if not user_owns_session(session_id, user_id):
            return {'error': 'You do not have access to this conversation'}, 403

        messages = get_session_history(session_id, limit=100)
        return {'session_id': session_id, 'messages': messages}, 200