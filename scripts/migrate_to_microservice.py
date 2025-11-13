#!/usr/bin/env python3
"""
Migration script to move existing chatbot data to independent microservice
"""
import os
import sys
import requests
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.models import Document as MainDocument
from app import create_app, db

def migrate_vector_data():
    """Migrate existing vector data from main app to chatbot service"""
    print("🚀 Starting vector data migration...")
    
    # Create main app to access existing data
    app = create_app()
    
    with app.app_context():
        # Get all existing documents
        documents = MainDocument.query.all()
        print(f"📊 Found {len(documents)} documents to migrate")
        
        if not documents:
            print("✅ No documents found to migrate")
            return
        
        # Prepare data for chatbot service
        docs_data = []
        for doc in documents:
            docs_data.append({
                "source": doc.source,
                "chunk_index": doc.chunk_index,
                "content": doc.content,
                "embedding": doc.embedding.tolist() if hasattr(doc.embedding, 'tolist') else doc.embedding,
                "created_at": doc.created_at.isoformat() if doc.created_at else None
            })
        
        # Send to chatbot service
        chatbot_url = os.getenv("CHATBOT_SERVICE_URL", "http://localhost:8000")
        
        try:
            response = requests.post(
                f"{chatbot_url}/api/v1/migrate/documents",
                json={"documents": docs_data},
                timeout=300  # 5 minutes for large migrations
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Migration successful: {result.get('migrated', 0)} documents")
            else:
                print(f"❌ Migration failed: {response.status_code} - {response.text}")
                
        except requests.RequestException as e:
            print(f"❌ Failed to connect to chatbot service: {e}")
            print("Make sure chatbot service is running at:", chatbot_url)



def sync_existing_blogs():
    """Sync existing blog posts to chatbot service"""
    print("📚 Syncing existing blog posts...")
    
    app = create_app()
    
    with app.app_context():
        from app.models import BlogPost
        from app.services.chatbot_client import ChatbotClient
        
        blogs = BlogPost.query.all()
        print(f"📖 Found {len(blogs)} blog posts to sync")
        
        if not blogs:
            print("✅ No blog posts found to sync")
            return
        
        client = ChatbotClient()
        blogs_data = [blog.to_dict() for blog in blogs]
        
        result = client.sync_blog_posts(blogs_data)
        
        if "error" in result:
            print(f"❌ Blog sync failed: {result['error']}")
        else:
            print(f"✅ Blog sync successful: {result.get('processed', 0)} blogs")

def health_check():
    """Check if chatbot service is healthy"""
    print("🏥 Checking chatbot service health...")
    
    from app.services.chatbot_client import ChatbotClient
    client = ChatbotClient()
    
    health = client.health_check()
    
    if health.get("status") == "healthy":
        print("✅ Chatbot service is healthy")
        return True
    else:
        print(f"❌ Chatbot service unhealthy: {health}")
        return False

if __name__ == "__main__":
    print("🔄 YesLove Chatbot Microservice Migration")
    print("=" * 50)
    
    # Check if chatbot service is running
    if not health_check():
        print("\n❌ Please start the chatbot service first:")
        print("cd chatbot-service && python main.py")
        sys.exit(1)
    
    # Run migrations
    migrate_vector_data()
    sync_existing_blogs()
    
    print("\n🎉 Migration completed!")
    print("Next steps:")
    print("1. Test chatbot functionality")
    print("2. Update main app to remove old chatbot code")
    print("3. Deploy both services")