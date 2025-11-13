"""Add source categorization columns to documents table"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import engine

def migrate():
    """Add new columns for source categorization"""
    with engine.connect() as conn:
        # Add new columns
        conn.execute(text("ALTER TABLE documents ADD COLUMN category TEXT NOT NULL DEFAULT 'yeslove.blogs'"))
        conn.execute(text("ALTER TABLE documents ADD COLUMN source_name TEXT"))
        conn.execute(text("ALTER TABLE documents ADD COLUMN priority INTEGER DEFAULT 1"))
        
        # Update existing records
        conn.execute(text("UPDATE documents SET category = 'yeslove.blogs', source_name = 'YesLove', priority = 1"))
        
        conn.commit()
        print("Migration completed successfully")

if __name__ == "__main__":
    migrate()