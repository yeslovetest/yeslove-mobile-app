"""Authentication utilities for chatbot service"""
import jwt
import requests
from functools import wraps
from flask import request, jsonify
import os

def verify_jwt_token(token):
    """Verify JWT token with main app's auth system"""
    try:
        # Get Keycloak public keys (same as main app)
        keycloak_url = os.getenv('KEYCLOAK_URL', 'http://localhost:8080')
        certs_url = f"{keycloak_url}/realms/YesLove_Auth/protocol/openid-connect/certs"
        
        response = requests.get(certs_url)
        jwks = response.json()
        
        # Decode and verify token
        header = jwt.get_unverified_header(token)
        key = None
        for jwk in jwks['keys']:
            if jwk['kid'] == header['kid']:
                key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
                break
        
        if not key:
            return None
            
        payload = jwt.decode(token, key, algorithms=['RS256'], audience='account')
        return payload
        
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None

def require_auth(f):
    """Decorator to require authentication for chatbot endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return {'error': 'Authentication required'}, 401
        
        token = auth_header.split(' ')[1]
        payload = verify_jwt_token(token)
        
        if not payload:
            return {'error': 'Invalid token'}, 401
        
        # Add user info to request context
        request.user_id = payload.get('sub')
        request.user_email = payload.get('email')
        
        return f(*args, **kwargs)
    
    return decorated_function