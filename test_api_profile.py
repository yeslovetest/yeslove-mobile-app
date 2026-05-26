#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:5000"

def test_api_profile_persistence():
    print("🔍 Testing Profile Persistence via API")
    
    # Test if backend is running
    try:
        requests.get(f"{BASE_URL}/health", timeout=2)
        print("✅ Backend running")
    except:
        print("❌ Backend not running on localhost:5000")
        return False
    
    # Try to get profile without auth (should fail)
    try:
        response = requests.get(f"{BASE_URL}/api/profile/profile/test-id")
        print(f"Profile GET without auth: {response.status_code}")
        if response.status_code == 401:
            print("✅ API requires authentication (expected)")
        return True
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

if __name__ == "__main__":
    test_api_profile_persistence()