import json
import os
import logging
from urllib.request import urlopen
from authlib.jose import jwt
from authlib.jose.errors import JoseError
from flask import request, jsonify
from functools import wraps
from app.logging_setup import logger  # ✅ Import the logger
from datetime import datetime

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
        "issuer_url": f"{server_url}/realms/{'YesLove_Auth'}",
        "certs_url": f"{server_url}/realms/{'YesLove_Auth'}/protocol/openid-connect/certs"
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

    logger.info(f"🔹 Fetching Keycloak public keys from: {certs_url}")  # ✅ Logging instead of print

    if not KEYCLOAK_PUBLIC_KEYS:
        try:
            response = urlopen(certs_url)
            KEYCLOAK_PUBLIC_KEYS = json.loads(response.read())
            logger.info("✅ Successfully fetched Keycloak public keys.")
        except Exception as e:
            logger.error(f"⚠️ Could not fetch Keycloak public keys. Error: {e}")
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
            logger.error("❌ Public keys not found.")
            return None

        keycloak_config = get_keycloak_config()
        expected_issuer = keycloak_config["issuer_url"]

        claims = jwt.decode(token, public_keys, claims_options={
            "exp": {"essential": True},
            "iss": {"essential": True}
        })

        # ✅ Token Expiration Check
        exp_timestamp = claims.get("exp")
        if exp_timestamp and datetime.utcfromtimestamp(exp_timestamp) < datetime.utcnow():
            logger.warning("❌ Token has expired.")
            return None

        # ✅ Issuer Validation
        if claims["iss"] != expected_issuer:
            logger.warning(f"❌ Invalid issuer! Expected: {expected_issuer}, Found: {claims['iss']}")
            return None

        # ✅ Log Successful JWT Decoding
        logger.info(f"✅ JWT decoded successfully for user {claims.get('preferred_username')}")
        return claims  # Return decoded claims

    except (JoseError, ValueError) as e:
        logger.error(f"❌ JWT verification failed: {e}")
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
                logger.warning("❌ Missing Authorization Header")
                return jsonify({"message": "❌ Missing Authorization Header"}), 401

            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
            decoded_token = verify_jwt(token)

            if not decoded_token:
                logger.warning("❌ Invalid or expired token")
                return jsonify({"message": "❌ Invalid or expired token"}), 401

            # ✅ Ensure `sub` (Keycloak user ID) is available
            keycloak_id = decoded_token.get("sub")
            if not keycloak_id:
                logger.error("❌ Invalid token: Missing 'sub' (Keycloak ID)")
                return jsonify({"message": "❌ Invalid token: Missing 'sub' (Keycloak ID)"}), 401

            # ✅ Attach user details to request context
            request.user = {
                "keycloak_id": keycloak_id,
                "email": decoded_token.get("email"),
                "username": decoded_token.get("preferred_username"),
                "realm_access": decoded_token.get("realm_access", {})  # <-- Add this line
            }

            logger.info(f"🔹 User authenticated: {request.user['username']} ({request.user['keycloak_id']})")
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

# -------------------------
# 🔹 Email Format Validation
# -------------------------

from email_validator import validate_email, EmailNotValidError

def is_valid_email(email: str) -> bool:
    try:
        validate_email(email, check_deliverability=True)
        return True
    except EmailNotValidError:
        return False
