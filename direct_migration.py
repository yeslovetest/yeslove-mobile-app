#!/usr/bin/env python3
"""
Direct migration script that accesses the database without Flask app
"""
import os
import sys
import requests
import sqlite3
import json

def health_check():
    """Check if chatbot service is healthy"""
    print("🏥 Checking chatbot service health...")
    
    try:
        response = requests.get("http://localhost:8000/api/v1/health", timeout=5)
        if response.status_code == 200:
            print("✅ Chatbot service is healthy")
            return True
        else:
            print(f"❌ Chatbot service unhealthy: {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"❌ Failed to connect to chatbot service: {e}")
        return False

def migrate_vector_data():
    """Migrate existing vector data from main app database"""
    print("🚀 Starting vector data migration...")
    
    # Connect to main app database
    db_path = "backend/instance/dev.db"
    if not os.path.exists(db_path):
        print("❌ Main app database not found at backend/instance/dev.db")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if documents table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='documents'")
        if not cursor.fetchone():
            print("✅ No documents table found - nothing to migrate")
            return
        
        # Get all documents
        cursor.execute("SELECT * FROM documents")
        documents = cursor.fetchall()
        
        if not documents:
            print("✅ No documents found to migrate")
            return
        
        print(f"📊 Found {len(documents)} documents to migrate")
        
        # Get column names
        cursor.execute("PRAGMA table_info(documents)")
        columns = [col[1] for col in cursor.fetchall()]
        
        # Prepare data for chatbot service
        docs_data = []
        for doc in documents:
            doc_dict = dict(zip(columns, doc))
            docs_data.append({
                "source": doc_dict.get("source", ""),
                "chunk_index": doc_dict.get("chunk_index", 0),
                "content": doc_dict.get("content", ""),
                "embedding": doc_dict.get("embedding", "[]"),
                "created_at": doc_dict.get("created_at", "")
            })
        
        # Send to chatbot service
        try:
            response = requests.post(
                "http://localhost:8000/api/v1/migrate/documents",
                json={"documents": docs_data},
                timeout=300
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Migration successful: {result.get('migrated', 0)} documents")
                if result.get('errors'):
                    print(f"⚠️ Errors: {result['errors']}")
            else:
                print(f"❌ Migration failed: {response.status_code} - {response.text}")
                
        except requests.RequestException as e:
            print(f"❌ Failed to send to chatbot service: {e}")
            
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    finally:
        conn.close()

def sync_existing_blogs():
    """Sync existing blog posts to chatbot service"""
    print("📚 Syncing existing blog posts...")
    
    # Connect to main app database
    db_path = "backend/instance/dev.db"
    if not os.path.exists(db_path):
        print("❌ Main app database not found")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if blog_posts table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='blog_posts'")
        if not cursor.fetchone():
            print("✅ No blog_posts table found - nothing to sync")
            return
        
        # Get all blog posts
        cursor.execute("SELECT * FROM blog_posts")
        blogs = cursor.fetchall()
        
        if not blogs:
            print("✅ No blog posts found to sync")
            return
        
        print(f"📖 Found {len(blogs)} blog posts to sync")
        
        # Get column names
        cursor.execute("PRAGMA table_info(blog_posts)")
        columns = [col[1] for col in cursor.fetchall()]
        
        # Prepare blog data
        blogs_data = []
        for blog in blogs:
            blog_dict = dict(zip(columns, blog))
            blogs_data.append({
                "id": blog_dict.get("id"),
                "title": blog_dict.get("title", ""),
                "content": blog_dict.get("content", ""),
                "author": "YesLove Team",
                "timestamp": blog_dict.get("timestamp", "")
            })
        
        # Send to chatbot service
        try:
            response = requests.post(
                "http://localhost:8000/api/v1/sync/blogs",
                json={"posts": blogs_data, "action": "create"},
                timeout=300
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Blog sync successful: {result.get('processed', 0)} blogs")
                if result.get('errors'):
                    print(f"⚠️ Errors: {result['errors']}")
            else:
                print(f"❌ Blog sync failed: {response.status_code} - {response.text}")
                
        except requests.RequestException as e:
            print(f"❌ Failed to sync blogs: {e}")
            
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 YesLove Chatbot Microservice Migration")
    print("=" * 50)
    
    # Check if chatbot service is running
    if not health_check():
        print("\n❌ Please start the chatbot service first:")
        print("cd chatbot-service && python3 main.py")
        sys.exit(1)
    
    # Run migrations
    migrate_vector_data()
    sync_existing_blogs()
    
    print("\n🎉 Migration completed!")
    print("Next steps:")
    print("1. Test chatbot functionality")
    print("2. Update main app to remove old chatbot code")
    print("3. Deploy both services")