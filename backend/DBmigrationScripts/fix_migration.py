#!/usr/bin/env python3
import os
import sys
from app import create_app
from flask_migrate import stamp, upgrade

app = create_app()

with app.app_context():
    try:
        # Mark existing migrations as applied
        print("Marking existing migrations as applied...")
        stamp('head')
        
        # Run the new migration
        print("Running new migration...")
        upgrade()
        
        print("✅ Migration fixed and completed!")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)