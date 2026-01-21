from flask_restx import Namespace, Resource
from app.core.database import SessionLocal
from sqlalchemy import text

api = Namespace("health", description="Health Check API")

@api.route('/health')
class HealthCheck(Resource):
    def get(self):
        """Health check endpoint"""
        try:
            # Test database connection
            with SessionLocal() as session:
                session.execute(text("SELECT 1"))
            
            return {
                "status": "healthy",
                "service": "chatbot-service",
                "database": "connected"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "service": "chatbot-service",
                "database": "disconnected",
                "error": str(e)
            }, 500