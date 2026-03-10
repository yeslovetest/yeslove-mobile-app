import json
import os
from datetime import datetime, timezone
from functools import wraps
from urllib.request import urlopen

from authlib.jose import jwt
from authlib.jose.errors import JoseError
from email_validator import EmailNotValidError, validate_email
from flask import request

from app.logging_setup import setup_logger

logger = setup_logger()


def get_auth_provider() -> str:
    """Return the JWT provider used by the API."""
    return os.getenv("AUTH_PROVIDER", "keycloak").strip().lower()


def get_keycloak_config():
    """
    Return JWT verification config.

    Keeps the historical function name for backward compatibility while
    supporting both Keycloak and Supabase.
    """
    provider = get_auth_provider()

    if provider == "supabase":
        supabase_url = (os.getenv("SUPABASE_URL") or "").rstrip("/")
        issuer_url = os.getenv("JWT_ISSUER_URL")
        certs_url = os.getenv("JWT_JWKS_URL")

        if not issuer_url and supabase_url:
            issuer_url = f"{supabase_url}/auth/v1"

        if not certs_url and supabase_url:
            certs_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"

        return {
            "provider": provider,
            "issuer_url": issuer_url,
            "certs_url": certs_url,
        }

    server_url = os.getenv("KEYCLOAK_SERVER_URL", "http://localhost:8080").rstrip("/")
    realm_name = os.getenv("KEYCLOAK_REALM_NAME", "YesLove_Auth")
    return {
        "provider": provider,
        "server_url": server_url,
        "realm_name": realm_name,
        "issuer_url": f"{server_url}/realms/{realm_name}",
        "certs_url": f"{server_url}/realms/{realm_name}/protocol/openid-connect/certs",
    }


# Cached JWKS payload and source URL.
KEYCLOAK_PUBLIC_KEYS = None
_JWKS_SOURCE_URL = None


def get_keycloak_public_keys():
    """Fetch and cache JWKS used for JWT validation."""
    global KEYCLOAK_PUBLIC_KEYS, _JWKS_SOURCE_URL

    auth_config = get_keycloak_config()
    certs_url = auth_config.get("certs_url")
    provider = auth_config.get("provider", "keycloak")

    if not certs_url:
        logger.error("JWT cert URL is not configured for provider '%s'", provider)
        return None

    if KEYCLOAK_PUBLIC_KEYS and _JWKS_SOURCE_URL == certs_url:
        return KEYCLOAK_PUBLIC_KEYS

    try:
        logger.info("Fetching JWKS from provider '%s': %s", provider, certs_url)
        response = urlopen(certs_url, timeout=8)
        KEYCLOAK_PUBLIC_KEYS = json.loads(response.read())
        _JWKS_SOURCE_URL = certs_url
        logger.info("JWT public keys loaded successfully")
        return KEYCLOAK_PUBLIC_KEYS
    except Exception as exc:
        logger.error("Could not fetch JWT public keys: %s", exc)
        return None


def verify_jwt(token):
    """Verify and decode a JWT token from configured auth provider."""
    try:
        public_keys = get_keycloak_public_keys()
        if not public_keys:
            logger.error("JWT public keys not available")
            return None

        auth_config = get_keycloak_config()
        expected_issuer = (auth_config.get("issuer_url") or "").rstrip("/")

        claims = jwt.decode(
            token,
            public_keys,
            claims_options={
                "exp": {"essential": True},
                "iss": {"essential": True},
            },
        )

        exp_timestamp = claims.get("exp")
        if exp_timestamp:
            expires_at = datetime.fromtimestamp(int(exp_timestamp), tz=timezone.utc)
            if expires_at <= datetime.now(timezone.utc):
                logger.warning("JWT token has expired")
                return None

        actual_issuer = (claims.get("iss") or "").rstrip("/")
        if expected_issuer and actual_issuer != expected_issuer:
            logger.warning("Invalid token issuer. expected=%s actual=%s", expected_issuer, actual_issuer)
            return None

        logger.info("JWT decoded successfully")
        return claims
    except (JoseError, ValueError, TypeError) as exc:
        logger.error("JWT verification failed: %s", exc)
        return None


def _extract_username(decoded_token):
    """Extract a display username from common JWT claim layouts."""
    preferred_username = decoded_token.get("preferred_username")
    if preferred_username:
        return preferred_username

    user_metadata = decoded_token.get("user_metadata") or {}
    if isinstance(user_metadata, dict):
        username = user_metadata.get("username") or user_metadata.get("name")
        if username:
            return username

    email = decoded_token.get("email")
    if email and "@" in email:
        return email.split("@", 1)[0]

    return None


def require_auth():
    """Protect Flask routes by enforcing JWT authentication."""

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                logger.warning("Missing Authorization header")
                return ({"message": "Missing Authorization header"}), 401

            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == "bearer":
                token = parts[1]
            else:
                token = auth_header.strip()

            decoded_token = verify_jwt(token)
            if not decoded_token:
                logger.warning("Invalid or expired token")
                return ({"message": "Invalid or expired token"}), 401

            keycloak_id = decoded_token.get("sub")
            if not keycloak_id:
                logger.error("Invalid token: missing 'sub' claim")
                return ({"message": "Invalid token: missing 'sub' claim"}), 401

            request.user = {
                "sub": keycloak_id,
                "keycloak_id": keycloak_id,
                "email": decoded_token.get("email"),
                "username": _extract_username(decoded_token),
                "realm_access": decoded_token.get("realm_access", {}),
                "provider": get_auth_provider(),
            }

            logger.info("User authenticated: %s", keycloak_id)
            return func(*args, **kwargs)

        return wrapper

    return decorator


ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


def allowed_file(filename):
    """Check if a file has an allowed extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def is_valid_email(email: str) -> bool:
    try:
        validate_email(email, check_deliverability=True)
        return True
    except EmailNotValidError:
        return False
