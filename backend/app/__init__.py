from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import atexit
import os
import sys
import click
import requests
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
from app.api.media.media_routes import api as media_api
from app.api.notifications.notification_routes import api as notifications_api
from app.api.video_podcast.video_podcast_routes import api as video_podcast_api
# from app.api.social.social_routes import api as social_api
from app.api.feed.recommendations_routes import api as recommendations_api
from app.api.admin.moderation_routes import api as admin_moderation_api


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
    api.add_namespace(video_podcast_api, path="/api/video-podcasts")
    # Device token API removed - handled by DeviceTokenService
    api.add_namespace(chatbot_api, path="/api/chatbot")
    api.add_namespace(media_api, path="/api/media")
    api.add_namespace(notifications_api, path="/api/notifications")
    api.add_namespace(recommendations_api, path="/api/recommendations")
    api.add_namespace(admin_moderation_api, path="/api/admin/moderation")
    
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

    skip_optional_services = _running_flask_command("db", "sync-wordpress-blogs", "sync-wordpress-videos")

    # 🔐 Fetch Keycloak Public Keys (Runs ONCE at startup)
    if not skip_optional_services:
        with app.app_context():
            get_keycloak_public_keys()

    # Initialize graph repository when configured. Memgraph and Neo4j both use Bolt.
    try:
        graph_provider = app.config.get("GRAPH_DB_PROVIDER", "memgraph")
        graph_uri = app.config.get("GRAPH_DB_URI") or app.config.get("NEO4J_URI")
        graph_user = app.config.get("GRAPH_DB_USER") or app.config.get("NEO4J_USER")
        graph_pass = app.config.get("GRAPH_DB_PASS") or app.config.get("NEO4J_PASS")

        if skip_optional_services:
            app.logger.info("Skipping optional graph initialization during Flask CLI command")
        elif graph_uri:
            graph_driver = create_driver(graph_uri, graph_user, graph_pass)
            graph_repository = GraphRepository(graph_driver)
            graph_repository.ensure_constraints()
            setattr(app, "graph_driver", graph_driver)
            setattr(app, "graph_repository", graph_repository)
            setattr(app, "graph_provider", graph_provider)
            app.logger.info("%s graph repository initialized", graph_provider)
        else:
            app.logger.info("Graph database not configured, using SQL-only graph fallback")
    except Exception:
        app.logger.exception("Failed to initialize graph repository")

    def shutdown_graph():
        driver = getattr(app, "graph_driver", None)
        if driver:
            try:
                close_driver(driver)
                setattr(app, "graph_driver", None)
            except Exception:
                app.logger.exception("Error closing graph driver")

    atexit.register(shutdown_graph)

    if os.getenv("ENABLE_EMBEDDED_CHATBOT", "false").lower() == "true":
        try:
            from app.chatbot_package.chatbot import Chatbot
            setattr(app, 'chatbot', Chatbot())
        except Exception:
            app.logger.exception("Failed to initialize embedded chatbot")
    
    # Initalises professional user admin panel
    from .admin import init_admin
    init_admin(app)

    @app.cli.command("sync-wordpress-blogs")
    @click.option("--page", default=1, show_default=True, type=int, help="First WordPress page to sync.")
    @click.option("--per-page", default=25, show_default=True, type=int, help="WordPress posts per request.")
    @click.option("--all-pages/--single-page", default=True, show_default=True, help="Sync every WordPress page from the starting page.")
    def sync_wordpress_blogs_command(page, per_page, all_pages):
        """Refresh cached WordPress blog posts in the app DB."""
        from app.services.wordpress_blog_service import sync_wordpress_posts_to_db

        page = max(page, 1)
        per_page = max(1, min(per_page, 100))
        synced = 0
        total = None

        try:
            while True:
                items, total = sync_wordpress_posts_to_db(page=page, per_page=per_page)
                synced += len(items)
                click.echo(f"Synced page {page}: {len(items)} posts")

                if not all_pages or not items or synced >= total:
                    break

                page += 1
        except requests.RequestException as exc:
            raise click.ClickException(f"Could not refresh blog posts from WordPress: {exc}") from exc

        click.echo(f"Synced {synced} WordPress blog posts into app DB cache ({total or synced} available).")

    @app.cli.command("sync-wordpress-videos")
    @click.option("--page", default=1, show_default=True, type=int, help="First WordPress page to sync.")
    @click.option("--per-page", default=10, show_default=True, type=int, help="WordPress posts per request.")
    @click.option("--all-pages/--single-page", default=True, show_default=True, help="Sync every WordPress page from the starting page.")
    @click.option("--sync-chatbot/--skip-chatbot", default=True, show_default=True, help="Sync videos to chatbot after caching.")
    def sync_wordpress_videos_command(page, per_page, all_pages, sync_chatbot):
        """Refresh cached WordPress video podcasts in the app DB."""
        from app.services.wordpress_video_service import sync_wordpress_videos_to_db

        page = max(page, 1)
        per_page = max(1, min(per_page, 100))
        synced = 0
        total = None
        total_pages = None

        try:
            while True:
                items, total, total_pages = sync_wordpress_videos_to_db(page=page, per_page=per_page, sync_chatbot=sync_chatbot)
                synced += len(items)
                click.echo(f"Synced page {page}: {len(items)} videos")

                if not all_pages or not items or page >= total_pages:
                    break

                page += 1
        except requests.RequestException as exc:
            raise click.ClickException(f"Could not refresh video podcasts from WordPress: {exc}") from exc

        click.echo(f"Synced {synced} WordPress video podcasts into app DB cache ({total or synced} available).")

    return app
