from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import os
from flask_restx import Api
from app.config import DevelopmentConfig
from authlib.integrations.flask_oauth2 import ResourceProtector
from app.utils import ClientCredsTokenValidator
from app.utils import require_auth 

# Initialize extensions but DO NOT import routes yet
db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Keycloak Validator
    validator = ClientCredsTokenValidator(app.config["KEYCLOAK_ISSUER"])
    require_auth.register_token_validator(validator)

    # Ensure the upload directory exists
    if not os.path.exists(app.config["UPLOAD_FOLDER"]):
        os.makedirs(app.config["UPLOAD_FOLDER"])

    # Initialize extensions with the app
    db.init_app(app)
    bcrypt.init_app(app)

    # ✅ Import routes here (AFTER initializing db)
    from app.routes import api as main_api

    # ✅ Register API Namespace
    api = Api(app, title="YesLove API", version="1.0", doc="/swagger")
    api.add_namespace(main_api, path="/api")

    return app
