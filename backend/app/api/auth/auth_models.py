    # ✅ Define API Request Models
from .auth_routes import api
from flask_restx import fields

SignupRequest = api.model("SignupRequest", {
    "email"            : fields.String(required=True, description="User email"),
    "confirm_email"    : fields.String(required=True, description="User email confirmation"),
    "password"         : fields.String(required=True, description="User password"),
    "confirm_password" : fields.String(required=True, description="Confirm your password"),
    "first_name"       : fields.String(required=True, description="Users first name"),
    "last_name"        : fields.String(required=True, description="Users last name"),
    "phone_number"     : fields.String(required=True, description="Users phone number"),
    "username"         : fields.String(required=True, description="Desired username"),


    "user_type"        : fields.String(
        required=True,
        description="Standard or Professional",
        enum=["Standard", "Professional"]
        ),

    "license_body" : fields.String(
        description = "License body (HCPC, BACP, UKCP)",
        enum=["HCPC", "BACP", "UKCP"]
        ),

    "license_number"    : fields.String(description="Professional license/registration number"),
    "consent_license_data" : fields.String(description="Consent to use and display license data"),
    "device_token": fields.String(required=False, description="Device token for push notifications"),
    "platform": fields.String(required=False, description="Device platform (ios/android)"),
    "device_id": fields.String(required=False, description="Unique device identifier"),
})

SignupResponse = api.model("SignupResponse", {
    "message": fields.String(description="Response message indicating success or failure of signup")})

LoginRequest = api.model("LoginRequest", {
    "username": fields.String(required=True, description="User login identifier (username or email)"),
    "password": fields.String(required=True, description="User password"),
        "device_token": fields.String(required=False, description="Device token for push notifications"),
        "platform": fields.String(required=False, description="Device platform (ios/android)"),
        "device_id": fields.String(required=False, description="Unique device identifier"),
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
    "provider": fields.String(description="Auth provider that issued the token"),
    "keycloak_id": fields.String(description="Provider subject id used by backend"),
    "user_id": fields.Integer(description="Local backend user id"),
    })

LogoutRequest = api.model("LogoutRequest", {
    "refresh_token" : fields.String(required=False, description="User refresh token")
})

RefreshTokenRequest = api.model("RefreshTokenRequest", {
        "refresh_token": fields.String(required=True, description="Valid refresh token")
    })

SetUserTypeRequest = api.model("SetUserTypeRequest", {
        "user_type": fields.String(required=True, description="Choose 'professional' or 'standard'"),
    "license": fields.String(description="License number (for professional users only)"),
    "license_number": fields.String(description="License number (for professional users only)"),
    "license_body": fields.String(description="License body (HCPC, BACP, UKCP)", enum=["HCPC", "BACP", "UKCP"]),
    "consent_license_data": fields.Boolean(description="Consent to use and display license data"),
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