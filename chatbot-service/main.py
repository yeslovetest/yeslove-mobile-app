import os
from flask import Flask
from flask_restx import Api
from flask_cors import CORS
from dotenv import load_dotenv

from app.api.chat import api as chat_api
from app.api.sync import api as sync_api
from app.api.health import api as health_api
from app.core.database import create_tables

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize API with enhanced documentation
    api = Api(
        app,
        title="YesLove Chatbot Service",
        version="1.0.0",
        doc="/docs",
        description="""Enhanced RAG Chatbot Service with Priority-Based Retrieval
        
        Features:
        • 23 approved relationship advice sources
        • Priority-based content retrieval (YesLove → Core → Abuse → Youth → Cultural → Contextual)
        • Crisis detection for abuse/harm queries
        • Multiple sync methods (scheduled, webhook, RSS, manual)
        • Source attribution and transparency
        • Cultural intelligence from diverse sources
        
        Base URL: http://127.0.0.1:8000
        """,
        contact="YesLove Development Team",
        contact_url="https://www.yeslove.co.uk"
    )
    
    # Register namespaces
    api.add_namespace(chat_api, path="/api/v1/chat")
    api.add_namespace(sync_api, path="/api/v1/sync")
    api.add_namespace(health_api, path="/api/v1")
    
    # Import and register migrate API
    from app.api.migrate import api as migrate_api
    api.add_namespace(migrate_api, path="/api/v1/migrate")
    
    # Register external sync API
    from app.api.external_sync import external_sync_bp
    app.register_blueprint(external_sync_bp)
    
    # Register admin API
    from app.api.admin import api as admin_api
    api.add_namespace(admin_api, path="/api/v1/admin")
    
    # Register webhook API
    from app.services.webhook_sync_service import webhook_bp
    app.register_blueprint(webhook_bp)
    
    # Start hybrid sync on startup
    from app.services.hybrid_sync_service import HybridSyncService
    hybrid_sync = HybridSyncService()
    hybrid_sync.start_production_sync()
    
    # Create database tables
    with app.app_context():
        create_tables()
    
    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=True)