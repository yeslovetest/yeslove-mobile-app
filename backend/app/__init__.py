from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import os
from flask_restx import Api
from app.config import DevelopmentConfig
from app.routes import main_api  # ✅ Import the correct API namespace
from app.utils import get_keycloak_public_keys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize extensions but DO NOT import routes yet
db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure the upload directory exists
    if not os.path.exists(app.config["UPLOAD_FOLDER"]):
        os.makedirs(app.config["UPLOAD_FOLDER"])

    # 🔹 Load Keycloak Configurations
    app.config["KEYCLOAK_SERVER_URL"] = os.getenv("KEYCLOAK_SERVER_URL", "http://localhost:8080")
    app.config["KEYCLOAK_REALM_NAME"] = os.getenv("KEYCLOAK_REALM_NAME", "master")
    app.config["KEYCLOAK_CLIENT_ID"] = os.getenv("KEYCLOAK_CLIENT_ID", "your-client-id")
    app.config["KEYCLOAK_CLIENT_SECRET"] = os.getenv("KEYCLOAK_CLIENT_SECRET", "your-client-secret")

    # 🔹 Load Keycloak Public Keys at Startup
    get_keycloak_public_keys()

    # Initialize extensions with the app
    db.init_app(app)
    bcrypt.init_app(app)

    # ✅ Initialize API correctly
    api = Api(app, title="YesLove API", version="1.0", doc="/swagger")

    # ✅ Register API Namespace
    api.add_namespace(main_api, path="/api")  # ✅ Ensure main_api is used, NOT `api`

    return app
