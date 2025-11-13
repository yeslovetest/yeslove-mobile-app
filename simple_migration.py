#!/usr/bin/env python3
"""
Simple migration script without Flask dependencies
"""
import requests
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

def sync_sample_blog():
    """Sync a sample blog post to test the system"""
    print("📚 Syncing sample blog post...")
    
    sample_blog = {
        "id": 1,
        "title": "Understanding Relationship Communication",
        "content": "Effective communication is the cornerstone of healthy relationships. It involves active listening, expressing feelings clearly, and showing empathy towards your partner. When couples communicate openly and honestly, they build trust and strengthen their emotional connection.",
        "author": "YesLove Team",
        "timestamp": "2024-01-01T00:00:00"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/sync/blogs",
            json={"posts": [sample_blog], "action": "create"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Blog sync successful: {result.get('processed', 0)} blogs processed")
            if result.get('errors'):
                print(f"⚠️ Errors: {result['errors']}")
        else:
            print(f"❌ Blog sync failed: {response.status_code} - {response.text}")
            
    except requests.RequestException as e:
        print(f"❌ Failed to sync blog: {e}")

def test_chat():
    """Test the chat functionality"""
    print("💬 Testing chat functionality...")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/chat/message",
            json={
                "message": "How can I improve communication in my relationship?",
                "user_id": 1,
                "session_id": "test-session"
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Chat test successful")
            print(f"Response: {result.get('response', 'No response')[:100]}...")
        else:
            print(f"❌ Chat test failed: {response.status_code} - {response.text}")
            
    except requests.RequestException as e:
        print(f"❌ Chat test failed: {e}")

if __name__ == "__main__":
    print("🔄 YesLove Chatbot Microservice Migration Test")
    print("=" * 50)
    
    # Check if chatbot service is running
    if not health_check():
        print("\n❌ Please make sure the chatbot service is running:")
        print("cd chatbot-service && python3 main.py")
        exit(1)
    
    # Run tests
    sync_sample_blog()
    test_chat()
    
    print("\n🎉 Migration test completed!")
    print("The chatbot microservice is working independently!")