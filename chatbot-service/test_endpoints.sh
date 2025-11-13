#!/bin/bash

BASE_URL="http://127.0.0.1:8000"

echo "🔍 Testing Chatbot Service Endpoints"
echo "=================================="

# 1. Health Check
echo "1. Testing Health Check..."
curl -X GET "$BASE_URL/api/v1/health" \
  -H "Content-Type: application/json" | jq .
echo -e "\n"

# 2. Manual Sync Trigger
echo "2. Testing Manual Sync Trigger..."
curl -X POST "$BASE_URL/api/v1/admin/sync/trigger" \
  -H "Content-Type: application/json" | jq .
echo -e "\n"

# 3. Webhook Content
echo "3. Testing Webhook Content..."
curl -X POST "$BASE_URL/api/v1/webhook/content" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Healthy relationships require trust, communication, and mutual respect. Setting boundaries is essential for emotional wellbeing.",
    "source_name": "Test Source",
    "category": "relationships.core"
  }' | jq .
echo -e "\n"

# 4. Chat Message
echo "4. Testing Chat Message..."
curl -X POST "$BASE_URL/api/v1/chat/message" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I build trust in a relationship?",
    "session_id": "test-session-123"
  }' | jq .
echo -e "\n"

# 5. Crisis Detection Test
echo "5. Testing Crisis Detection..."
curl -X POST "$BASE_URL/api/v1/chat/message" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am experiencing domestic abuse and need help",
    "session_id": "test-session-456"
  }' | jq .

echo -e "\n✅ All endpoint tests completed!"