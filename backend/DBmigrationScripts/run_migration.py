#!/usr/bin/env python3
import os
import sys
from app import create_app
from flask_migrate import upgrade

app = create_app()

with app.app_context():
    try:
        upgrade()
        print("✅ Migration completed successfully!")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)