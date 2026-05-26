#!/usr/bin/env python3
"""
Database schema inspection script to check profile-related tables and data.
"""

import sqlite3
import os
import sys
from datetime import datetime

def find_database():
    """Find the database file"""
    db_paths = [
        "/Users/charlesjackson/YesLove_LatestRepo/yeslove-mobile-app/backend/instance/dev.db",
        "/Users/charlesjackson/YesLove_LatestRepo/yeslove-mobile-app/backend/dev.db",
        "/Users/charlesjackson/YesLove_LatestRepo/yeslove-mobile-app/instance/development.db",
        "/Users/charlesjackson/YesLove_LatestRepo/yeslove-mobile-app/backend/instance/development.db"
    ]
    
    for db_path in db_paths:
        if os.path.exists(db_path):
            return db_path
    return None

def inspect_database(db_path):
    """Inspect database schema and data"""
    print(f"🔍 Inspecting database: {db_path}")
    print("=" * 60)
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("📋 Available Tables:")
        for table in tables:
            print(f"   - {table[0]}")
        
        # Check User table schema
        print("\\n👤 User Table Schema:")
        cursor.execute("PRAGMA table_info(user);")
        user_columns = cursor.fetchall()
        for col in user_columns:
            print(f"   {col[1]} ({col[2]}) - {'NOT NULL' if col[3] else 'NULL'}")
        
        # Check if there are any users
        cursor.execute("SELECT COUNT(*) FROM user;")
        user_count = cursor.fetchone()[0]
        print(f"\\n📊 Total users in database: {user_count}")
        
        if user_count > 0:
            # Show sample user data (without sensitive info)
            cursor.execute("""
                SELECT id, keycloak_id, username, email, bio, profile_pic_url, 
                       user_type, created_at, phone_number, address, website, birthday
                FROM user 
                LIMIT 3;
            """)
            users = cursor.fetchall()
            
            print("\\n👥 Sample User Data:")
            for user in users:
                print(f"   ID: {user[0]}")
                print(f"   Keycloak ID: {user[1]}")
                print(f"   Username: {user[2]}")
                print(f"   Email: {user[3]}")
                print(f"   Bio: {user[4] or 'N/A'}")
                print(f"   Profile Pic: {user[5] or 'N/A'}")
                print(f"   User Type: {user[6]}")
                print(f"   Created: {user[7]}")
                print(f"   Phone: {user[8] or 'N/A'}")
                print(f"   Address: {user[9] or 'N/A'}")
                print(f"   Website: {user[10] or 'N/A'}")
                print(f"   Birthday: {user[11] or 'N/A'}")
                print("   " + "-" * 40)
        
        # Check Professional Details table if exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='professional_details';")
        if cursor.fetchone():
            print("\\n🏥 Professional Details Table Schema:")
            cursor.execute("PRAGMA table_info(professional_details);")
            prof_columns = cursor.fetchall()
            for col in prof_columns:
                print(f"   {col[1]} ({col[2]}) - {'NOT NULL' if col[3] else 'NULL'}")
            
            cursor.execute("SELECT COUNT(*) FROM professional_details;")
            prof_count = cursor.fetchone()[0]
            print(f"\\n📊 Professional details records: {prof_count}")
        
        # Check Profile Visibility Settings
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='profile_visibility_settings';")
        if cursor.fetchone():
            cursor.execute("SELECT COUNT(*) FROM profile_visibility_settings;")
            vis_count = cursor.fetchone()[0]
            print(f"\\n🔒 Profile visibility settings: {vis_count}")
            
            if vis_count > 0:
                cursor.execute("SELECT user_id, setting_id, value, category FROM profile_visibility_settings LIMIT 5;")
                settings = cursor.fetchall()
                print("   Sample settings:")
                for setting in settings:
                    print(f"     User: {setting[0]}, Setting: {setting[1]}, Value: {setting[2]}, Category: {setting[3]}")
        
        # Check Email Notification Settings
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='email_notification_settings';")
        if cursor.fetchone():
            cursor.execute("SELECT COUNT(*) FROM email_notification_settings;")
            email_count = cursor.fetchone()[0]
            print(f"\\n📧 Email notification settings: {email_count}")
        
        # Check recent profile updates (if there's a timestamp)
        cursor.execute("""
            SELECT username, bio, profile_pic_url, created_at 
            FROM user 
            WHERE bio IS NOT NULL OR profile_pic_url IS NOT NULL
            ORDER BY created_at DESC 
            LIMIT 5;
        """)
        recent_updates = cursor.fetchall()
        
        if recent_updates:
            print("\\n🔄 Recent Profile Updates:")
            for update in recent_updates:
                print(f"   {update[0]}: Bio='{update[1] or 'N/A'}', Pic='{update[2] or 'N/A'}', Updated: {update[3]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error inspecting database: {e}")
        return False

def check_profile_persistence_indicators():
    """Check for indicators that profile persistence is working"""
    print("\\n🔍 Profile Persistence Health Check:")
    print("=" * 40)
    
    db_path = find_database()
    if not db_path:
        print("❌ No database found")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check 1: Users with non-empty bios
        cursor.execute("SELECT COUNT(*) FROM user WHERE bio IS NOT NULL AND bio != '';")
        bio_count = cursor.fetchone()[0]
        print(f"✅ Users with bios: {bio_count}")
        
        # Check 2: Users with profile pictures
        cursor.execute("SELECT COUNT(*) FROM user WHERE profile_pic_url IS NOT NULL AND profile_pic_url != '';")
        pic_count = cursor.fetchone()[0]
        print(f"✅ Users with profile pictures: {pic_count}")
        
        # Check 3: Users with contact info
        cursor.execute("SELECT COUNT(*) FROM user WHERE phone_number IS NOT NULL OR address IS NOT NULL OR website IS NOT NULL;")
        contact_count = cursor.fetchone()[0]
        print(f"✅ Users with contact info: {contact_count}")
        
        # Check 4: Professional details
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='professional_details';")
        if cursor.fetchone():
            cursor.execute("SELECT COUNT(*) FROM professional_details;")
            prof_count = cursor.fetchone()[0]
            print(f"✅ Professional details records: {prof_count}")
        
        # Check 5: Settings persistence
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='profile_visibility_settings';")
        if cursor.fetchone():
            cursor.execute("SELECT COUNT(*) FROM profile_visibility_settings;")
            vis_count = cursor.fetchone()[0]
            print(f"✅ Profile visibility settings: {vis_count}")
        
        conn.close()
        
        # Summary
        total_indicators = bio_count + pic_count + contact_count
        if total_indicators > 0:
            print(f"\\n🎉 Profile persistence appears to be working! ({total_indicators} indicators found)")
            return True
        else:
            print("\\n⚠️  No profile data found - either no users have updated profiles or persistence isn't working")
            return False
            
    except Exception as e:
        print(f"❌ Error checking persistence: {e}")
        return False

if __name__ == "__main__":
    print("Database Profile Persistence Inspector")
    print("=" * 60)
    
    db_path = find_database()
    if not db_path:
        print("❌ No database file found!")
        print("\\nExpected locations:")
        print("- backend/instance/dev.db")
        print("- backend/dev.db") 
        print("- instance/development.db")
        sys.exit(1)
    
    print(f"✅ Database found: {db_path}")
    print(f"📁 File size: {os.path.getsize(db_path)} bytes")
    print(f"📅 Last modified: {datetime.fromtimestamp(os.path.getmtime(db_path))}")
    
    # Inspect the database
    if inspect_database(db_path):
        check_profile_persistence_indicators()
    else:
        print("❌ Database inspection failed")
        sys.exit(1)