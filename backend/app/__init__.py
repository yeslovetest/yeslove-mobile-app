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

# Load environment variables
load_dotenv()

# 🔹 Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
migrate = Migrate()

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

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
    from app.routes import main_api
    api = Api(app, title="YesLove API", version="1.0", doc="/swagger")
    api.add_namespace(main_api, path="/api")

    # 🔐 Fetch Keycloak Public Keys (Runs ONCE at startup)
    with app.app_context():
        get_keycloak_public_keys()

    return app
