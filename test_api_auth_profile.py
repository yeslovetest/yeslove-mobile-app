#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:5000"

def test_profile_via_api():
    # Step 1: Login to get token
    login_data = {
        "username": "jcharles",
        "password": "your_password_here"  # Replace with actual password
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return False
        
        token = login_response.json().get("access_token")
        print("✅ Login successful")
        
        # Step 2: Get Keycloak ID
        headers = {"Authorization": f"Bearer {token}"}
        keycloak_response = requests.post(
            f"{BASE_URL}/api/profile/user/keycloak_id",
            json={"username": "jcharles"},
            headers=headers
        )
        
        if keycloak_response.status_code != 200:
            print(f"❌ Failed to get Keycloak ID: {keycloak_response.status_code}")
            return False
            
        keycloak_id = keycloak_response.json().get("keycloak_id")
        print(f"✅ Got Keycloak ID: {keycloak_id}")
        
        # Step 3: Update profile via API
        profile_update = {
            "bio": "Updated via API test",
            "contact_info": {
                "name": "Charles Jackson",
                "email": "charlesk@outlook.com",
                "phone": "+1987654321",
                "address": "456 API Test Street",
                "website": "https://api-test.com"
            }
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/profile/update_profile",
            json=profile_update,
            headers=headers
        )
        
        if update_response.status_code == 200:
            print("✅ Profile updated via API")
            
            # Step 4: Verify by getting profile
            get_response = requests.get(
                f"{BASE_URL}/api/profile/profile/{keycloak_id}",
                headers=headers
            )
            
            if get_response.status_code == 200:
                profile = get_response.json()
                print(f"✅ Profile retrieved: Bio = '{profile.get('bio')}'")
                print(f"✅ Contact info: {profile.get('contact_info', {})}")
                return True
            else:
                print(f"❌ Failed to get profile: {get_response.status_code}")
        else:
            print(f"❌ Profile update failed: {update_response.status_code}")
            print(f"Response: {update_response.text}")
            
    except Exception as e:
        print(f"❌ API test failed: {e}")
        
    return False

if __name__ == "__main__":
    print("🔍 Testing Profile Persistence via API with Authentication")
    success = test_profile_via_api()
    print(f"\n{'✅ SUCCESS' if success else '❌ FAILED'}: API profile persistence test")