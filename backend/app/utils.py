import json
import os
from urllib.request import urlopen
from functools import wraps
from flask import request, jsonify
from authlib.jose import jwt
from authlib.jose.errors import JoseError
from authlib.jose.rfc7517.jwk import JsonWebKey
from authlib.oauth2.rfc7523 import JWTBearerTokenValidator



# -------------------------
# 🔹 Keycloak Configuration
# -------------------------
KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL", "http://localhost:8080")
KEYCLOAK_REALM_NAME = os.getenv("KEYCLOAK_REALM_NAME", "master")
KEYCLOAK_ISSUER = f"{KEYCLOAK_SERVER_URL}/realms/{KEYCLOAK_REALM_NAME}"
KEYCLOAK_PUBLIC_KEY_URL = f"{KEYCLOAK_ISSUER}/protocol/openid-connect/certs"

# Cache for Keycloak Public Keys
KEYCLOAK_PUBLIC_KEYS = None


# -------------------------
# 🔹 Fetch & Cache Keycloak Public Keys
# -------------------------
def get_keycloak_public_keys():
    """Fetch Keycloak public keys for JWT validation."""
    global KEYCLOAK_PUBLIC_KEYS
    if not KEYCLOAK_PUBLIC_KEYS:
        try:
            response = urlopen(KEYCLOAK_PUBLIC_KEY_URL)
            KEYCLOAK_PUBLIC_KEYS = json.loads(response.read())
        except Exception as e:
            print(f"Error fetching Keycloak public keys: {e}")
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
            return None

        claims = jwt.decode(token, public_keys, claims_options={
            "exp": {"essential": True},
            "iss": {"essential": True, "value": KEYCLOAK_ISSUER},
        })
        claims.validate()
        return claims  # Return decoded claims
    except (JoseError, ValueError) as e:
        print(f"JWT verification failed: {e}")
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
                return jsonify({"message": "Missing Authorization Header"}), 401
            
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
            decoded_token = verify_jwt(token)

            if not decoded_token:
                return jsonify({"message": "Invalid or expired token"}), 401

            # Attach decoded user details to request context
            request.user = decoded_token
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