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

    # --- Graph, Cache and Queue defaults ---
    # Neo4j (Bolt)
    NEO4J_URI = os.environ.get('NEO4J_URI', 'bolt://localhost:7687')
    NEO4J_USER = os.environ.get('NEO4J_USER', 'neo4j')
    NEO4J_PASS = os.environ.get('NEO4J_PASS', '')

    # Redis (feed cache)
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

    # RabbitMQ (AMQP)
    RABBITMQ_URL = os.environ.get('RABBITMQ_URL', 'amqp://user:pass@localhost:5672/%2F')
    RABBITMQ_USER = os.environ.get('RABBITMQ_USER', 'user')
    RABBITMQ_PASS = os.environ.get('RABBITMQ_PASS', 'pass')

class DevelopmentConfig(Config):
    """Development Configuration"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI", "sqlite:///dev.db")
    
    # Media Service Configuration
    USE_S3_STORAGE = os.getenv("USE_S3_STORAGE", "true").lower() == "false"

    # ✅ Keycloak Configuration
    KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL", "http://localhost:8080")
    KEYCLOAK_REALM_NAME = os.getenv("KEYCLOAK_REALM_NAME", "YesLove_Auth")
    KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "yeslove")
    KEYCLOAK_CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET", "fBRbYdMRY7L8V3RY0Y6RgxMihPeP7yBV")

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

    # Development overrides for Graph/Cache/Queue
    NEO4J_URI = os.environ.get('NEO4J_URI', 'bolt://localhost:7687')
    NEO4J_USER = os.environ.get('NEO4J_USER', 'neo4j')
    NEO4J_PASS = os.environ.get('NEO4J_PASS', 'testpassword')

    REDIS_URL = os.environ.get('REDIS_URL', 'redis://redis:6379/0')

    RABBITMQ_URL = os.environ.get('RABBITMQ_URL', 'amqp://user:testpassword@rabbitmq:5672/%2F')
    RABBITMQ_USER = os.environ.get('RABBITMQ_USER', 'user')
    RABBITMQ_PASS = os.environ.get('RABBITMQ_PASS', 'testpassword')


class TestingConfig(Config):
    """Testing environment configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///testing.db'

class ProductionConfig(Config):
    """Production environment configuration."""
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://admin:password@localhost/yeslove'
    
    # Object storage
    USE_S3_STORAGE = os.getenv("USE_S3_STORAGE", "true").lower() == "true"
    
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'production-secret-key-change-me'
    
    # Keycloak Production URLs
    KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL", "https://auth.yeslove.com")
    KEYCLOAK_REALM_NAME = os.getenv("KEYCLOAK_REALM_NAME", "YesLove_Auth")
    KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "yeslove")
    KEYCLOAK_CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET")
    KEYCLOAK_ADMIN_USER = os.getenv('KEYCLOAK_ADMIN_USER')
    KEYCLOAK_ADMIN_PASS = os.getenv('KEYCLOAK_ADMIN_PASS')
    
    @staticmethod
    def keycloak_issuer():
        return f"{ProductionConfig.KEYCLOAK_SERVER_URL}/realms/{ProductionConfig.KEYCLOAK_REALM_NAME}"
    
    @staticmethod
    def keycloak_certs_url():
        return f"{ProductionConfig.keycloak_issuer()}/protocol/openid-connect/certs"
