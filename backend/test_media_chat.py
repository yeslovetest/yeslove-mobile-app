#!/usr/bin/env python3
"""
Test script for chat media functionality
"""

import requests
import os

# Test configuration
BASE_URL = "http://localhost:5000/api"
TEST_TOKEN = "your_test_token_here"  # Replace with actual token

def test_media_upload():
    """Test media upload for chat"""
    
    # Create a test image file
    test_image_path = "/tmp/test_image.jpg"
    if not os.path.exists(test_image_path):
        # Create a simple test image
        from PIL import Image
        img = Image.new('RGB', (100, 100), color='red')
        img.save(test_image_path)
    
    headers = {"Authorization": f"Bearer {TEST_TOKEN}"}
    
    # Test chat media upload
    with open(test_image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/media/chat-upload", files=files, headers=headers)
        
    if response.status_code == 201:
        media_id = response.json()['media_id']
        print(f"✅ Media uploaded successfully: {media_id}")
        return media_id
    else:
        print(f"❌ Media upload failed: {response.text}")
        return None

def test_send_media_message(media_id, receiver_id):
    """Test sending a message with media attachment"""
    
    headers = {"Authorization": f"Bearer {TEST_TOKEN}", "Content-Type": "application/json"}
    
    data = {
        "receiver_id": receiver_id,
        "message": "Check out this image!",
        "media_id": media_id
    }
    
    response = requests.post(f"{BASE_URL}/chat/send_message", json=data, headers=headers)
    
    if response.status_code == 201:
        print("✅ Media message sent successfully")
    else:
        print(f"❌ Failed to send media message: {response.text}")

if __name__ == "__main__":
    print("Testing chat media functionality...")
    
    # Test media upload
    media_id = test_media_upload()
    
    if media_id:
        # Test sending media message (replace with actual receiver ID)
        test_receiver_id = "test_receiver_keycloak_id"
        test_send_media_message(media_id, test_receiver_id)
    
    print("Test completed!")