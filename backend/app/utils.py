import json
import os
from urllib.request import urlopen
from authlib.jose import jwt
from authlib.jose.errors import JoseError
from flask import request, jsonify
from functools import wraps

# -------------------------
# 🔹 Keycloak Configuration
# -------------------------
def get_keycloak_config():
    """Retrieve Keycloak configuration dynamically."""
    server_url = os.getenv("KEYCLOAK_SERVER_URL", "http://localhost:8080").rstrip("/")
    realm_name = os.getenv("KEYCLOAK_REALM_NAME", "YesLove_Auth")

    return {
        "server_url": server_url,
        "realm_name": realm_name,
        "issuer_url": f"{server_url}/realms/{"YesLove_Auth"}",
        "certs_url": f"{server_url}/realms/{"YesLove_Auth"}/protocol/openid-connect/certs"
    }


# -------------------------
# 🔹 Fetch & Cache Keycloak Public Keys
# -------------------------
KEYCLOAK_PUBLIC_KEYS = None  # Cache for public keys

def get_keycloak_public_keys():
    """Fetch and cache Keycloak public keys for JWT validation."""
    global KEYCLOAK_PUBLIC_KEYS

    keycloak_config = get_keycloak_config()
    certs_url = keycloak_config["certs_url"]

    print(f"🔹 Fetching Keycloak public keys from: {certs_url}")  # Debug output

    if not KEYCLOAK_PUBLIC_KEYS:
        try:
            response = urlopen(certs_url)
            KEYCLOAK_PUBLIC_KEYS = json.loads(response.read())
            print("✅ Successfully fetched Keycloak public keys.")
        except Exception as e:
            print(f"⚠️ Warning: Could not fetch Keycloak public keys. Error: {e}")
            return None

    return KEYCLOAK_PUBLIC_KEYS


# -------------------------
# 🔹 JWT Token Verification
# -------------------------
def verify_jwt(token):
    """Verify and decode a JWT token from Keycloak."""
    try:
        public_keys = get_keycloak_public_keys()
        if not public_keys:
            print("❌ Public keys not found.")
            return None

        keycloak_config = get_keycloak_config()
        expected_issuer = keycloak_config["issuer_url"]

        claims = jwt.decode(token, public_keys, claims_options={
            "exp": {"essential": True},
            "iss": {"essential": True}
        })

        # ✅ Dynamically check issuer
        if claims["iss"] != expected_issuer:
            print(f"❌ Invalid issuer! Expected: {expected_issuer}, Found: {claims['iss']}")
            return None

        print("✅ JWT decoded successfully:", claims)  # Debug print
        return claims  # Return decoded claims
    except (JoseError, ValueError) as e:
        print(f"❌ JWT verification failed: {e}")
        return None


# -------------------------
# 🔹 Flask Route Protection Decorator
# -------------------------
def require_auth():
    """Protect Flask routes by enforcing Keycloak JWT authentication."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", None)
            if not auth_header:
                return {"message": "❌ Missing Authorization Header"}, 401

            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
            decoded_token = verify_jwt(token)

            if not decoded_token:
                return {"message": "❌ Invalid or expired token"}, 401

            # ✅ Ensure `sub` (Keycloak user ID) is available
            keycloak_id = decoded_token.get("sub")
            if not keycloak_id:
                return {"message": "❌ Invalid token: Missing 'sub' (Keycloak ID)"}, 401

            # ✅ Attach user details to request context
            request.user = {
                "keycloak_id": keycloak_id,
                "email": decoded_token.get("email"),
                "username": decoded_token.get("preferred_username"),
            }

            return f(*args, **kwargs)

        return wrapper
    return decorator

# -------------------------
# 🔹 File Upload Helper Functions
# -------------------------
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    """Check if a file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
