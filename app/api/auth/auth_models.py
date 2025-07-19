    # ✅ Define API Request Models
from .auth_routes import api
from flask_restx import fields

LoginRequest = api.model("LoginRequest", {
        "username": fields.String(required=True, description="User's Keycloak username"),
        "password": fields.String(required=True, description="User's Keycloak password"),
    })

TokenResponse = api.model("TokenResponse", {
        "access_token": fields.String(description="JWT access token"),
        "expires_in": fields.Integer(description="Access token expiration time in seconds"),
        "refresh_expires_in": fields.Integer(description="Refresh token expiration time in seconds"),
        "refresh_token": fields.String(description="JWT refresh token"),
        "token_type": fields.String(description="Type of token, typically 'Bearer'"),
        "not-before-policy": fields.Integer(description="Time before which the token is not valid"),
        "session_state": fields.String(description="Session identifier"),
        "scope": fields.String(description="Scopes associated with the token"),
    })

LogoutRequest = api.model("LogoutRequest", {})

RefreshTokenRequest = api.model("RefreshTokenRequest", {
        "refresh_token": fields.String(required=True, description="Valid refresh token")
    })

SetUserTypeRequest = api.model("SetUserTypeRequest", {
        "user_type": fields.String(required=True, description="Choose 'professional' or 'standard'"),
        "license": fields.String(description="License number (for professional users only)"),
        "specialization": fields.String(description="Specialization field (for professional users only)")
    })

ChangePasswordRequest = api.model("ChangePasswordRequest", {
        "new_password": fields.String(required=True, description="New password for the user")
    })

ResetPasswordRequest = api.model("ResetPasswordRequest", {
        "email": fields.String(required=True, description="User's email for password reset")
    })

DeleteAccountRequest = api.model("DeleteAccountRequest", {
        "confirmation": fields.Boolean(required=True, description="Confirmation required to delete the account")
    })