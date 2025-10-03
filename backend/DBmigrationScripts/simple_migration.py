#!/usr/bin/env python3
import sqlite3
import os

# Connect to database
db_path = 'instance/development.db'
if not os.path.exists(db_path):
    print(f"Database not found at {os.path.abspath(db_path)}")
    exit(1)
else:
    print(f"Found database at {os.path.abspath(db_path)}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if columns exist before adding
    cursor.execute("PRAGMA table_info(post)")
    post_columns = [col[1] for col in cursor.fetchall()]
    
    if 'image_url' not in post_columns:
        print("Adding image_url to post table...")
        cursor.execute("ALTER TABLE post ADD COLUMN image_url VARCHAR(500)")
    
    if 'image' in post_columns:
        print("Removing image column from post table...")
        # SQLite doesn't support DROP COLUMN, need to recreate table
        cursor.execute("""
            CREATE TABLE post_new (
                id INTEGER PRIMARY KEY,
                content TEXT NOT NULL,
                image_url VARCHAR(500),
                timestamp DATETIME,
                user_id INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
            )
        """)
        cursor.execute("INSERT INTO post_new (id, content, timestamp, user_id) SELECT id, content, timestamp, user_id FROM post")
        cursor.execute("DROP TABLE post")
        cursor.execute("ALTER TABLE post_new RENAME TO post")
    
    # Check user table
    cursor.execute("PRAGMA table_info(user)")
    user_columns = [col[1] for col in cursor.fetchall()]
    
    if 'profile_pic_url' not in user_columns:
        print("Adding profile_pic_url to user table...")
        cursor.execute("ALTER TABLE user ADD COLUMN profile_pic_url VARCHAR(500)")
    
    # Check event table
    cursor.execute("PRAGMA table_info(event)")
    event_columns = [col[1] for col in cursor.fetchall()]
    
    if 'image_url' not in event_columns:
        print("Adding image_url to event table...")
        cursor.execute("ALTER TABLE event ADD COLUMN image_url VARCHAR(500)")
    
    conn.commit()
    print("✅ Database migration completed successfully!")
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    conn.rollback()
finally:
    conn.close()