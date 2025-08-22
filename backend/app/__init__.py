from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import os
from flask_restx import Api
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv
from app.config import DevelopmentConfig
from app.utils import get_keycloak_public_keys
from app.api.auth.auth_routes import api as auth_api
from app.api.profile.profile_routes import api as profile_api
from app.api.feed.feed_routes import api as feed_api
from app.api.chat.chat_routes import api as chat_api
from app.api.blog.blog_routes import api as blog_api
from app.api.deviceToken.device_token_routes import api as device_token_api
from app.api.chatbot.chatbot_routes import api as chatbot_api
from app.chatbot_package.chatbot import Chatbot
from app.api.media.media_routes import api as media_api


# Load environment variables
load_dotenv()

# 🔹 Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
migrate = Migrate()

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
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

    # 📊 Initialize API
    api = Api(app, title="YesLove API", version="1.0", doc="/swagger")

    api.add_namespace(profile_api, path="/api/profile")
    api.add_namespace(auth_api, path="/api/auth")
    api.add_namespace(feed_api, path="/api/feed")
    api.add_namespace(chat_api, path="/api/chat")
    api.add_namespace(blog_api, path="/api/blog")
    api.add_namespace(device_token_api, path="/api/device")
    api.add_namespace(chatbot_api, path="/api/chatbot")
    api.add_namespace(media_api, path="/api/media")

    from .models import User, Post, Chat, Comment, ProfessionalDetails, ProfileVisibilitySettings, Follow, Reaction, Like, EmailNotificationSettings
    
    # 🔐 Fetch Keycloak Public Keys (Runs ONCE at startup)
    with app.app_context():
        get_keycloak_public_keys()

    app.chatbot = Chatbot() #initializing the chatbot
    
    # Initalises professional user admin panel
    from .admin import init_admin
    init_admin(app)

    
    return app
