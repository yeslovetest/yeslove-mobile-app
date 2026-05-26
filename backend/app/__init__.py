from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import atexit
import os
from flask_restx import Api
from flask_cors import CORS
from flask_migrate import Migrate
from prometheus_flask_exporter import PrometheusMetrics

from dotenv import load_dotenv
from app.config import DevelopmentConfig
from app.utils import get_keycloak_public_keys
from app.graph.neo4j_client import create_driver, close_driver
from app.graph.repository import GraphRepository
from app.api.auth.auth_routes import api as auth_api
from app.api.profile.profile_routes import api as profile_api
from app.api.feed.feed_routes import api as feed_api
from app.api.chat.chat_routes import api as chat_api

from app.api.events.events_routes import api as events_api
from app.api.blog.blog_routes import api as blog_api
# Device token API removed - handled by DeviceTokenService in auth routes
from app.api.chatbot.chatbot_routes import api as chatbot_api
from app.chatbot_package.chatbot import Chatbot
from app.api.media.media_routes import api as media_api
from app.api.notifications.notification_routes import api as notifications_api
# from app.api.social.social_routes import api as social_api
from app.api.feed.recommendations_routes import api as recommendations_api


# Load environment variables
load_dotenv()

# 🔹 Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
migrate = Migrate()

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)

    # Initialising of monitoring stack 
    metrics = PrometheusMetrics(app)
    
    # Custom metrics setup
    try:
        from prometheus_client import Info
        app_info = Info('yeslove_app_info', 'Application information')
        app_info.info({'version': '1.0', 'environment': os.getenv('ENVIRONMENT', 'development')})
    except:
        pass  # Ignore if prometheus_client not available

    app.config.from_object(config_class)
    # app.config['SQLALCHEMY_DATABASE_URI'] = config_class.SQLALCHEMY_DATABASE_URI

    # 🌍 Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # 🚀 Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)

    # 🔐 Keycloak Configuration (Load from config.py)
    app.config["KEYCLOAK_SERVER_URL"] = config_class.KEYCLOAK_SERVER_URL
    app.config["KEYCLOAK_REALM_NAME"] = config_class.KEYCLOAK_REALM_NAME
    app.config["KEYCLOAK_CLIENT_ID"] = config_class.KEYCLOAK_CLIENT_ID
    app.config["KEYCLOAK_CLIENT_SECRET"] = config_class.KEYCLOAK_CLIENT_SECRET
    app.config["KEYCLOAK_ISSUER"] = config_class.keycloak_issuer()
    app.config["KEYCLOAK_CERTS_URL"] = config_class.keycloak_certs_url()
    
    # 📊 Initialize API with JWT authorization
    authorizations = {
        'Bearer': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'JWT Authorization header using the Bearer scheme. Example: "Bearer {token}"'
        }
    }
    
    api = Api(
        app, 
        title="YesLove API", 
        version="1.0", 
        doc="/swagger",
        authorizations=authorizations,
        security='Bearer'
    )

    api.add_namespace(profile_api, path="/api/profile")
    api.add_namespace(auth_api, path="/api/auth")
    api.add_namespace(feed_api, path="/api/feed")
    api.add_namespace(chat_api, path="/api/chat")
    api.add_namespace(events_api, path="/api/events")
    api.add_namespace(blog_api, path="/api/blog")
    # Device token API removed - handled by DeviceTokenService
    api.add_namespace(chatbot_api, path="/api/chatbot")
    api.add_namespace(media_api, path="/api/media")
    api.add_namespace(notifications_api, path="/api/notifications")
    api.add_namespace(recommendations_api, path="/api/recommendations")
    
    # Register health check endpoints
    from app.monitoring.health import health_bp
    app.register_blueprint(health_bp)

    from .models import User, Post, Chat, Comment, ProfessionalDetails, ProfileVisibilitySettings, Follow, Reaction, Like, EmailNotificationSettings, BlogView
    
    from sqlalchemy import event
    from sqlalchemy.engine import Engine
    import sqlite3
    # ✅ Register least/greatest for SQLite
    @event.listens_for(Engine, "connect")
    def sqlite_add_functions(dbapi_connection, connection_record):
        if isinstance(dbapi_connection, sqlite3.Connection):
            dbapi_connection.create_function("least", 2, lambda a, b: min(a, b))
            dbapi_connection.create_function("greatest", 2, lambda a, b: max(a, b))

    # 🔐 Fetch Keycloak Public Keys (Runs ONCE at startup)
    with app.app_context():
        get_keycloak_public_keys()

    # Initialize Neo4j graph repository when configured.
    try:
        neo4j_uri = app.config.get("NEO4J_URI")
        neo4j_user = app.config.get("NEO4J_USER")
        neo4j_pass = app.config.get("NEO4J_PASS")

        if neo4j_uri and neo4j_user and neo4j_pass:
            graph_driver = create_driver(neo4j_uri, neo4j_user, neo4j_pass)
            graph_repository = GraphRepository(graph_driver)
            graph_repository.ensure_constraints()
            setattr(app, "graph_driver", graph_driver)
            setattr(app, "graph_repository", graph_repository)
            app.logger.info("Neo4j graph repository initialized")
        else:
            app.logger.info("Neo4j not fully configured, using SQL-only graph fallback")
    except Exception:
        app.logger.exception("Failed to initialize Neo4j graph repository")

    def shutdown_graph():
        driver = getattr(app, "graph_driver", None)
        if driver:
            try:
                close_driver(driver)
                setattr(app, "graph_driver", None)
            except Exception:
                app.logger.exception("Error closing Neo4j driver")

    atexit.register(shutdown_graph)

    setattr(app, 'chatbot', Chatbot()) #initializing the chatbot
    
    # Initalises professional user admin panel
    from .admin import init_admin
    init_admin(app)

    return app
