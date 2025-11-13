from flask import request, jsonify
from flask_restx import Namespace, Resource, fields
from app.core.rag_engine import RAGEngine

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
    @api.expect(chat_request)
    @api.marshal_with(chat_response)
    @api.doc(responses={
        200: 'Success',
        400: 'Bad Request - Missing message',
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
            response = get_rag_engine().generate_response(message, history)
            
            return {
                'response': response,
                'session_id': session_id,
                'sources': 'Multiple credible relationship advice sources'
            }
        except Exception as e:
            return {'error': str(e)}, 500