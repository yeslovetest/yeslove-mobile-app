from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import os
from app.config import DevelopmentConfig, TestingConfig, ProductionConfig

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

# Ensure the upload directory exists
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])


    # Initialize extensions with the app
    db.init_app(app)
    bcrypt.init_app(app)

    # Import and register blueprints (routes)
    from .routes import main
    app.register_blueprint(main)

    return app
