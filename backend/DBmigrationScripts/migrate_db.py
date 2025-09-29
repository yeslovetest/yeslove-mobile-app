#!/usr/bin/env python3
"""Database migration script"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from flask_migrate import upgrade, migrate, init

def run_migration():
    app = create_app()
    
    with app.app_context():
        try:
            # Generate migration if needed
            print("Generating migration...")
            migrate(message="Update image fields to S3 URLs")
            
            # Apply migration
            print("Applying migration...")
            upgrade()
            
            print("✅ Database migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            return False
    
    return True

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)