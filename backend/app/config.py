import os

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'default_secret_key'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Upload Folder Configuration
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))  # Base directory of the project
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')  # Absolute path to upload folder
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # Maximum file size: 16MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}  # Allowed file types

class DevelopmentConfig(Config):
    """Development environment configuration."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///development.db'

class TestingConfig(Config):
    """Testing environment configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///testing.db'

class ProductionConfig(Config):
    """Production environment configuration."""
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///production.db'



class Config:
    KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL", "http://localhost:8080")
    KEYCLOAK_REALM_NAME = os.getenv("KEYCLOAK_REALM_NAME", "your-realm")
    KEYCLOAK_ISSUER = f"{KEYCLOAK_SERVER_URL}/realms/{KEYCLOAK_REALM_NAME}"

