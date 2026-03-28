#!/usr/bin/env python3
"""
Test script to verify profile information persistence to the database.
This script checks if profile updates are properly saved to the database.
"""

import requests
import json
import sys
import os

# Configuration
BASE_URL = "http://localhost:5000"  # Adjust if your backend runs on different port
TEST_USER_DATA = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword123"
}

def get_auth_token():
    """Get authentication token for API requests"""
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": TEST_USER_DATA["username"],
            "password": TEST_USER_DATA["password"]
        })
        
        if response.status_code == 200:
            token_data = response.json()
            return token_data.get("access_token")
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return None

def get_user_keycloak_id(token):
    """Get user's Keycloak ID"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(f"{BASE_URL}/api/profile/user/keycloak_id", 
                               json={"username": TEST_USER_DATA["username"]},
                               headers=headers)
        
        if response.status_code == 200:
            user_data = response.json()
            return user_data.get("keycloak_id")
        else:
            print(f"❌ Failed to get Keycloak ID: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error getting Keycloak ID: {e}")
        return None

def get_profile(token, keycloak_id):
    """Get current profile data"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/profile/profile/{keycloak_id}", headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Failed to get profile: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error getting profile: {e}")
        return None

def update_profile(token, profile_data):
    """Update profile data"""
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        response = requests.put(f"{BASE_URL}/api/profile/update_profile", 
                              json=profile_data, headers=headers)
        
        if response.status_code == 200:
            return True
        else:
            print(f"❌ Failed to update profile: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error updating profile: {e}")
        return False

def test_profile_persistence():
    """Main test function"""
    print("🔍 Testing Profile Information Persistence...")
    print("=" * 50)
    
    # Step 1: Get authentication token
    print("1️⃣ Getting authentication token...")
    token = get_auth_token()
    if not token:
        print("❌ Cannot proceed without authentication token")
        return False
    print("✅ Authentication successful")
    
    # Step 2: Get user's Keycloak ID
    print("\\n2️⃣ Getting user Keycloak ID...")
    keycloak_id = get_user_keycloak_id(token)
    if not keycloak_id:
        print("❌ Cannot proceed without Keycloak ID")
        return False
    print(f"✅ Keycloak ID: {keycloak_id}")
    
    # Step 3: Get current profile
    print("\\n3️⃣ Getting current profile...")
    original_profile = get_profile(token, keycloak_id)
    if not original_profile:
        print("❌ Cannot get current profile")
        return False
    print("✅ Current profile retrieved")
    print(f"   Bio: {original_profile.get('bio', 'N/A')}")
    print(f"   Contact Info: {original_profile.get('contact_info', {})}")
    
    # Step 4: Update profile with test data
    print("\\n4️⃣ Updating profile with test data...")
    test_bio = "Updated bio for persistence test"
    test_contact = {
        "name": "Test User Updated",
        "email": TEST_USER_DATA["email"],
        "phone": "+1234567890",
        "address": "123 Test Street, Test City",
        "website": "https://test-website.com"
    }
    
    updated_profile = {
        "bio": test_bio,
        "contact_info": test_contact,
        "education_info": original_profile.get("education_info", {})
    }
    
    update_success = update_profile(token, updated_profile)
    if not update_success:
        print("❌ Profile update failed")
        return False
    print("✅ Profile update request sent")
    
    # Step 5: Verify persistence by fetching updated profile
    print("\\n5️⃣ Verifying persistence...")
    updated_profile_data = get_profile(token, keycloak_id)
    if not updated_profile_data:
        print("❌ Cannot verify persistence - failed to fetch updated profile")
        return False
    
    # Check if changes were persisted
    persistence_verified = True
    
    if updated_profile_data.get("bio") != test_bio:
        print(f"❌ Bio not persisted. Expected: '{test_bio}', Got: '{updated_profile_data.get('bio')}'")
        persistence_verified = False
    else:
        print(f"✅ Bio persisted correctly: '{test_bio}'")
    
    contact_info = updated_profile_data.get("contact_info", {})
    for key, expected_value in test_contact.items():
        actual_value = contact_info.get(key)
        if actual_value != expected_value:
            print(f"❌ Contact {key} not persisted. Expected: '{expected_value}', Got: '{actual_value}'")
            persistence_verified = False
        else:
            print(f"✅ Contact {key} persisted correctly: '{expected_value}'")
    
    # Step 6: Summary
    print("\\n" + "=" * 50)
    if persistence_verified:
        print("🎉 SUCCESS: Profile information is being persisted to the database!")
        print("✅ All profile updates were successfully saved and retrieved")
    else:
        print("❌ FAILURE: Profile information persistence has issues!")
        print("⚠️  Some profile updates were not properly saved to the database")
    
    return persistence_verified

def check_database_directly():
    """Check database directly if possible"""
    print("\\n🔍 Checking database directly...")
    
    # Try to check if database file exists
    db_paths = [
        "/Users/charlesjackson/YesLove_LatestRepo/yeslove-mobile-app/backend/instance/dev.db",
        "/Users/charlesjackson/YesLove_LatestRepo/yeslove-mobile-app/backend/dev.db",
        "/Users/charlesjackson/YesLove_LatestRepo/yeslove-mobile-app/instance/development.db"
    ]
    
    for db_path in db_paths:
        if os.path.exists(db_path):
            print(f"✅ Database file found: {db_path}")
            print(f"   File size: {os.path.getsize(db_path)} bytes")
            return db_path
    
    print("⚠️  No database file found in expected locations")
    return None

if __name__ == "__main__":
    print("Profile Persistence Test")
    print("=" * 50)
    
    # Check if backend is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print("✅ Backend is running")
    except:
        print("❌ Backend is not running or not accessible")
        print(f"   Make sure your backend is running on {BASE_URL}")
        sys.exit(1)
    
    # Check database
    db_path = check_database_directly()
    
    # Run the main test
    success = test_profile_persistence()
    
    if success:
        print("\\n🎯 CONCLUSION: Profile persistence is working correctly!")
    else:
        print("\\n🚨 CONCLUSION: Profile persistence needs attention!")
        print("\\nPossible issues to check:")
        print("- Database connection")
        print("- Profile update API endpoint")
        print("- Database schema/migrations")
        print("- Transaction commits")
    
    sys.exit(0 if success else 1)