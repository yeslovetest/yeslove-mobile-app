#!/usr/bin/env python3
import sqlite3
import os

# Connect to database
db_path = 'instance/dev.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if blog_view table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='blog_view'")
    table_exists = cursor.fetchone()
    
    if not table_exists:
        print("Creating blog_view table...")
        cursor.execute("""
            CREATE TABLE blog_view (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                blog_id INTEGER NOT NULL,
                viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                read_duration INTEGER,
                FOREIGN KEY (user_id) REFERENCES user (id),
                FOREIGN KEY (blog_id) REFERENCES blog_posts (id),
                UNIQUE(user_id, blog_id)
            )
        """)
        
        # Create indexes for better performance
        cursor.execute("CREATE INDEX ix_blog_view_user_id ON blog_view (user_id)")
        cursor.execute("CREATE INDEX ix_blog_view_blog_id ON blog_view (blog_id)")
        
        conn.commit()
        print("✅ blog_view table created successfully!")
    else:
        print("blog_view table already exists")
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    conn.rollback()
finally:
    conn.close()