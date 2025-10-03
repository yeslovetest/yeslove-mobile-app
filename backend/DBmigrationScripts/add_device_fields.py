#!/usr/bin/env python3
import sqlite3
import os

# Connect to database
db_path = 'instance/dev.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if device_token table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='device_token'")
    table_exists = cursor.fetchone()
    
    if table_exists:
        # Check current columns
        cursor.execute("PRAGMA table_info(device_token)")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"Current device_token columns: {columns}")
        
        # Add device_id column if missing
        if 'device_id' not in columns:
            print("Adding device_id column...")
            cursor.execute("ALTER TABLE device_token ADD COLUMN device_id VARCHAR(255)")
        
        # Add last_used column if missing
        if 'last_used' not in columns:
            print("Adding last_used column...")
            cursor.execute("ALTER TABLE device_token ADD COLUMN last_used DATETIME")
            # Update existing rows with current timestamp
            cursor.execute("UPDATE device_token SET last_used = CURRENT_TIMESTAMP WHERE last_used IS NULL")
        
        conn.commit()
        print("✅ Device token table updated successfully!")
    else:
        print("Device token table doesn't exist yet - will be created by future migrations")
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    conn.rollback()
finally:
    conn.close()