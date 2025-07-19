# app/utils/auth_utils.py
from functools import wraps
from flask import request, jsonify
import jwt  # or use python-jose if you prefer
from functools import wraps


def require_auth():
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return {"message": "Missing or invalid token"}, 401
            
            token = auth_header.split(" ")[1]
            try:
                decoded = jwt.decode(token, options={"verify_signature": False}, algorithms=["RS256"])

                # 👇 ADD THIS LINE
                decoded["keycloak_id"] = decoded.get("sub")

                # 👇 Save token to request.user
                request.user = decoded

            except Exception as e:
                return {"message": "Invalid token", "error": str(e)}, 401

            return f(*args, **kwargs)
        return wrapper
    return decorator

def verify_jwt(token):
    try:
        # Replace with your actual verification logic and secret/public key
        decoded = jwt.decode(token, options={"verify_signature": False}, algorithms=["RS256"])
        return decoded  # ✅ return decoded payload (dict)
    except Exception as e:
        return None
