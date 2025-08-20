#!/bin/bash

# Load env variables
KEYCLOAK_SERVER_URL=${KEYCLOAK_SERVER_URL:-http://localhost:8080}
REALM=${KEYCLOAK_REALM_NAME:-YesLove_Auth}
CLIENT_ID=${KEYCLOAK_CLIENT_ID:-yeslove}

# Admin credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change_me"

# Get access token
TOKEN_RESPONSE=$(curl -s -X POST "$KEYCLOAK_SERVER_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USERNAME" \
  -d "password=$ADMIN_PASSWORD" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to get access token. Check your admin credentials."
  exit 1
fi

# Fetch realm config (without users)
echo "Fetching realm config..."
REALM_JSON=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$KEYCLOAK_SERVER_URL/admin/realms/$REALM")

# Fetch users array
echo "Fetching users..."
USERS_JSON=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$KEYCLOAK_SERVER_URL/admin/realms/$REALM/users")

# Combine: add users array into realm JSON
echo "Combining realm config and users..."
COMBINED_JSON=$(echo "$REALM_JSON" | jq --argjson users "$USERS_JSON" '. + {users: $users}')

# Save combined JSON to file
OUTPUT_FILE="${REALM}-realm.json"
echo "$COMBINED_JSON" | jq '.' > "$OUTPUT_FILE"

echo "Combined realm + users export saved to $OUTPUT_FILE"
