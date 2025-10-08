#!/usr/bin/env python3
import sqlite3

conn = sqlite3.connect('instance/dev.db')
cursor = conn.cursor()

try:
    # Clean up post table - remove old image column
    print("Cleaning up post table...")
    cursor.execute("""
        CREATE TABLE post_final (
            id INTEGER PRIMARY KEY,
            content TEXT NOT NULL,
            image_url VARCHAR(500),
            timestamp DATETIME,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
        )
    """)
    
    # Copy data from post table
    cursor.execute("INSERT INTO post_final (id, content, image_url, timestamp, user_id) SELECT id, content, image_url, timestamp, user_id FROM post")
    
    # Drop old tables and rename
    cursor.execute("DROP TABLE post")
    cursor.execute("DROP TABLE post_new")
    cursor.execute("ALTER TABLE post_final RENAME TO post")
    
    # Clean up user table - remove old profile_pic column  
    print("Cleaning up user table...")
    cursor.execute("""
        CREATE TABLE user_final (
            id INTEGER PRIMARY KEY,
            keycloak_id VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone_number VARCHAR(20),
            address VARCHAR(255),
            website VARCHAR(255),
            birthday DATE,
            created_at DATETIME,
            bio VARCHAR(250),
            profile_pic_url VARCHAR(500),
            user_type VARCHAR(20)
        )
    """)
    
    cursor.execute("""
        INSERT INTO user_final 
        SELECT id, keycloak_id, username, email, phone_number, address, website, birthday, created_at, bio, profile_pic_url, user_type 
        FROM user
    """)
    
    cursor.execute("DROP TABLE user")
    cursor.execute("ALTER TABLE user_final RENAME TO user")
    
    conn.commit()
    print("✅ Database cleanup completed!")
    
except Exception as e:
    print(f"❌ Cleanup failed: {e}")
    conn.rollback()
finally:
    conn.close()