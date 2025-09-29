#!/usr/bin/env python3
import sqlite3
import os

# Connect to database
db_path = 'instance/dev.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"Existing tables: {tables}")
    
    # Update post table
    if 'post' in tables:
        cursor.execute("PRAGMA table_info(post)")
        post_columns = [col[1] for col in cursor.fetchall()]
        print(f"Post columns: {post_columns}")
        
        if 'image_url' not in post_columns:
            print("Adding image_url to post table...")
            cursor.execute("ALTER TABLE post ADD COLUMN image_url VARCHAR(500)")
    
    # Update user table  
    if 'user' in tables:
        cursor.execute("PRAGMA table_info(user)")
        user_columns = [col[1] for col in cursor.fetchall()]
        print(f"User columns: {user_columns}")
        
        if 'profile_pic_url' not in user_columns:
            print("Adding profile_pic_url to user table...")
            cursor.execute("ALTER TABLE user ADD COLUMN profile_pic_url VARCHAR(500)")
    
    # Update event table only if it exists
    if 'event' in tables:
        cursor.execute("PRAGMA table_info(event)")
        event_columns = [col[1] for col in cursor.fetchall()]
        print(f"Event columns: {event_columns}")
        
        if 'image_url' not in event_columns:
            print("Adding image_url to event table...")
            cursor.execute("ALTER TABLE event ADD COLUMN image_url VARCHAR(500)")
    else:
        print("Event table doesn't exist yet - will be created by future migrations")
    
    conn.commit()
    print("✅ Database migration completed successfully!")
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    conn.rollback()
finally:
    conn.close()