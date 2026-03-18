#!/usr/bin/env python3
"""Production application entry point for AWS deployment"""
import os
from app import create_app
from app.config import DevelopmentConfig, ProductionConfig

def _use_production_config() -> bool:
    """Use production settings for Railway and DATABASE_URL-based deployments."""
    return any(
        [
            os.getenv('FLASK_ENV') == 'production',
            bool(os.getenv('RAILWAY_ENVIRONMENT')),
            bool(os.getenv('DATABASE_URL')),
        ]
    )


# Determine config based on environment
config_class = ProductionConfig if _use_production_config() else DevelopmentConfig

# Create Flask application
application = create_app(config_class)

if __name__ == "__main__":
    # For local development
    application.run(host='0.0.0.0', port=5000, debug=True)