import os


class Config:
    """Base Configuration"""
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
    SQLALCHEMY_TRACK_MODIFICATIONS = False


    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'default_secret_key'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Upload Folder Configuration
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))  # Base directory of the project
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')  # Absolute path to upload folder
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # Maximum file size: 16MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}  # Allowed file types

class DevelopmentConfig(Config):
    """Development Configuration"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI", "sqlite:///dev.db")

    # ✅ Keycloak Configuration
    KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL", "http://localhost:8080")
    KEYCLOAK_REALM_NAME = os.getenv("KEYCLOAK_REALM_NAME", "YesLove_Auth")
    KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "yeslove")
<<<<<<< HEAD
    KEYCLOAK_CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET", "S7G8tim4Xv1e0pfIy63q1uyz3WOVEdYX")
=======
    KEYCLOAK_CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET", "fBRbYdMRY7L8V3RY0Y6RgxMihPeP7yBV")
>>>>>>> 442125f0e6c2deda34b2955840a9821f95007986

    KEYCLOAK_ADMIN_USER    = os.getenv('KEYCLOAK_ADMIN_USER')
    KEYCLOAK_ADMIN_PASS    = os.getenv('KEYCLOAK_ADMIN_PASS')
    
    @staticmethod
    def keycloak_issuer():
        """Return Keycloak Issuer URL"""
        return f"{DevelopmentConfig.KEYCLOAK_SERVER_URL}/realms/{DevelopmentConfig.KEYCLOAK_REALM_NAME}"

    @staticmethod
    def keycloak_certs_url():
        """Return Keycloak Public Keys URL"""
        return f"{DevelopmentConfig.keycloak_issuer()}/protocol/openid-connect/certs"


class TestingConfig(Config):
    """Testing environment configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///testing.db'

class ProductionConfig(Config):
    """Production environment configuration."""
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///production.db'
