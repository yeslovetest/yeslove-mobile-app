#!/usr/bin/env python3
"""Production application entry point for AWS deployment"""
import os
from app import create_app
from app.config import DevelopmentConfig, ProductionConfig

# Determine config based on environment
config_class = ProductionConfig if os.getenv('FLASK_ENV') == 'production' else DevelopmentConfig

# Create Flask application
application = create_app(config_class)

if __name__ == "__main__":
    # For local development
    application.run(host='0.0.0.0', port=5001, debug=True)