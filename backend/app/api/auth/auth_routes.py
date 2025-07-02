# ✅ Define the API Namespaces
from flask import current_app, request
from flask_restx import Namespace, Resource
import requests

from app.logging_setup import logger
from app.utils import require_auth



api = Namespace("auth", description="API Endpoints")

@api.route("/login")
class Login(Resource):
    from .auth_models import LoginRequest, TokenResponse
    @api.expect(LoginRequest)  # ✅ Attach the correct model
    @api.response(200, "Success", TokenResponse)  # ✅ Ensure correct model
    def post(self):
        """Exchange user credentials for a Keycloak access token and check user type."""
        from app.utils import verify_jwt  # ✅ Avoid circular imports
        from ...models import ProfessionalDetails, User, db

        # ✅ Get JSON payload and handle missing content-type
        data = request.get_json(silent=True)
        if not data:
            logger.error("❌ No JSON payload received")
            return {"message": "Invalid request. Expected JSON payload."}, 400

        username = data.get("username")  # ✅ Corrected
        password = data.get("password")  # ✅ Corrected

        if not username or not password:
            logger.error("❌ Missing username or password")
            return {"message": "Username and password are required"}, 400
        
        

        keycloak_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/realms/{current_app.config['KEYCLOAK_REALM_NAME']}/protocol/openid-connect/token"
        
        logger.info(f"Keycloak URL: {keycloak_url}")  #✅ Log the URL
                     
        payload = {
            "grant_type": "password",
            "client_id": current_app.config["KEYCLOAK_CLIENT_ID"],
            "client_secret": current_app.config["KEYCLOAK_CLIENT_SECRET"],
            "username": username,
            "password": password
        }

        response = requests.post(keycloak_url, data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"})
        logger.info(f"Keycloak response: {response.status_code} - {response.text}")  # ✅ Debug response


        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")

            # ✅ Decode token to get user info
            user_info = verify_jwt(access_token)
            if not user_info:
                logger.error("❌ Invalid token received from Keycloak")
                return {"message": "Invalid token received from Keycloak"}, 401

            # ✅ Get Keycloak roles
            keycloak_roles = user_info.get("realm_access", {}).get("roles", [])
            logger.info(f"User roles from Keycloak: {keycloak_roles}")

            # Determine user type
            user_type = "professional" if "professional" in keycloak_roles else "standard"

            # ✅ Ensure user exists in local DB
            user = User.query.filter_by(keycloak_id=user_info["sub"]).first()
            if not user:
                logger.info(f"🔹 Creating new user {user_info['preferred_username']} in database...")
                user = User(
                    keycloak_id=user_info["sub"],
                    username=user_info.get("preferred_username", username),
                    email=user_info.get("email", ""),
                    user_type=user_type
                )
                db.session.add(user)
                db.session.commit()
                logger.info(f"✅ User {user.username} created successfully.")

            # ✅ If user is professional, ensure they have details
            if user.user_type == "professional":
                professional_details = ProfessionalDetails.query.filter_by(user_id=user.id).first()
                if not professional_details:
                    return {
                        "message": "Professional details missing. Please provide license and specialization.",
                        "set_professional_details_required": True
                    }, 200

            logger.info(f"✅ User {user.username} logged in successfully.")
            return token_data, 200

        logger.error("❌ Invalid login credentials")
        return {"message": "Invalid login credentials"}, response.status_code

@api.route("/signup")
class Signup(Resource):
    def post(self):
        """Keycloak handles user registration."""
        return {"message": "User signup is handled by Keycloak"}, 400
    
@api.route("/logout")
class Logout(Resource):
    from .auth_models import LogoutRequest
    @require_auth()
    @api.expect(LogoutRequest)  # ✅ Attach model
    def post(self):
        """Logout user from Keycloak."""
        token = request.headers.get("Authorization").split(" ")[1]
        keycloak_logout_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/realms/{current_app.config['KEYCLOAK_REALM_NAME']}/protocol/openid-connect/logout"

        response = requests.post(
            keycloak_logout_url,
            headers={"Authorization": f"Bearer {token}"},
        )

        if response.status_code == 204:
            return {"message": "Logged out successfully"}, 200
        return {"message": "Logout failed"}, response.status_code

@api.route("/refresh_token")
class RefreshToken(Resource):
    from .auth_models import RefreshTokenRequest, TokenResponse
    @api.expect(RefreshTokenRequest)  # ✅ Attach model
    @api.response(200, "Success",TokenResponse)  # ✅ Ensure correct model
    def post(self):
        """Refresh expired access token using Keycloak refresh token."""
        data = request.json
        refresh_token = data.get("refresh_token")

        if not refresh_token:
            return {"message": "Missing refresh token"}, 400

        keycloak_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/realms/{current_app.config['KEYCLOAK_REALM_NAME']}/protocol/openid-connect/token"
        payload = {
            "grant_type": "refresh_token",
            "client_id": current_app.config["KEYCLOAK_CLIENT_ID"],
            "client_secret": current_app.config["KEYCLOAK_CLIENT_SECRET"],
            "refresh_token": refresh_token
        }

        response = requests.post(keycloak_url, data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"})

        if response.status_code == 200:
            return response.json(), 200
        
        return {"message": "Failed to refresh token"}, response.status_code
    
    
    
@api.route("/set_user_type")
class SetUserType(Resource):
    from .auth_models import SetUserTypeRequest
    @require_auth()
    @api.expect(SetUserTypeRequest)  # ✅ Attach model
    def post(self):
        """Set user type (professional or standard) for new users."""
        from app.models import User, ProfessionalDetails, db
        data = request.json
        keycloak_id = request.user["keycloak_id"]  # Get from token
        user_type = data.get("user_type")  # Expect "professional" or "standard"
        license = data.get("license")  # Only for professionals
        specialization = data.get("specialization")  # Only for professionals

        if user_type not in ["professional", "standard"]:
            return {"message": "Invalid user type. Choose 'professional' or 'standard'."}, 400

        user = User.query.filter_by(keycloak_id=keycloak_id).first()
        if not user:
            return {"message": "User not found"}, 404

        # ✅ Prevent changing user type if Keycloak has already assigned it
        keycloak_roles = request.user.get("realm_access", {}).get("roles", [])
        if "professional" in keycloak_roles or "standard" in keycloak_roles:
            return {"message": "User type is managed by Keycloak. Manual change not allowed."}, 400

        # ✅ Update user type
        user.user_type = user_type
        db.session.commit()

        if user_type == "professional":
            # ✅ Ensure ProfessionalDetails are created
            professional_details = ProfessionalDetails(
                user_id=user.id,
                license=license,
                specialization=specialization
            )
            db.session.add(professional_details)
            db.session.commit()
            logger.info(f"✅ User {user.username} set as a professional.")

        logger.info(f"✅ User {user.username} set as {user_type}.")
        return {"message": f"User type set to {user_type}"}, 200


    
# -------------------------
# 🚀 Change Password ROUTES
# -------------------------

@api.route("/change_password")
class ChangePassword(Resource):
    from .auth_models import ChangePasswordRequest
    @require_auth()
    @api.expect(ChangePasswordRequest)
    def post(self):
        """Change user password via Keycloak API."""
        from app.models import User
        data = request.json
        new_password = data.get("new_password")

        if not new_password:
            return {"message": "New password is required"}, 400

        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        keycloak_admin_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/admin/realms/{current_app.config['KEYCLOAK_REALM_NAME']}/users/{user.keycloak_id}/reset-password"
        payload = {
            "type": "password",
            "value": new_password,
            "temporary": False
        }
        headers = {"Authorization": f"Bearer {request.headers.get('Authorization').split()[1]}"}

        response = requests.put(keycloak_admin_url, json=payload, headers=headers)

        if response.status_code == 204:
            return {"message": "Password changed successfully"}, 200
        return {"message": "Failed to change password"}, response.status_code


# -------------------------
# 🚀 RESET PASSWORD (KEYCLOAK)
# -------------------------

@api.route("/reset_password")
class ResetPassword(Resource):
    from .auth_models import ResetPasswordRequest
    @api.expect(ResetPasswordRequest)
    def post(self):
        """Send password reset email via Keycloak API."""
        data = request.json
        email = data.get("email")

        if not email:
            return {"message": "Email is required"}, 400

        keycloak_reset_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/realms/{current_app.config['KEYCLOAK_REALM_NAME']}/protocol/openid-connect/auth"
        payload = {
            "client_id": current_app.config["KEYCLOAK_CLIENT_ID"],
            "redirect_uri": current_app.config["FRONTEND_URL"],
            "response_type": "code",
            "scope": "openid",
            "kc_action": "UPDATE_PASSWORD",
            "email": email
        }

        response = requests.post(keycloak_reset_url, json=payload)

        if response.status_code == 200:
            return {"message": "Password reset email sent"}, 200
        return {"message": "Failed to send password reset email"}, response.status_code




# -------------------------
# 🚀 DELETE ACCOUNT (KEYCLOAK)
# -------------------------

@api.route("/delete_account")
class DeleteAccount(Resource):
    from .auth_models import DeleteAccountRequest
    @require_auth()
    @api.expect(DeleteAccountRequest)
    def delete(self):
        """Delete user account via Keycloak API."""
        from app.models import User, db
        user_id = request.user["keycloak_id"]
        user = User.query.filter_by(keycloak_id=user_id).first()
        if not user:
            return {"message": "User not found"}, 404

        keycloak_delete_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/admin/realms/{current_app.config['KEYCLOAK_REALM_NAME']}/users/{user_id}"
        headers = {"Authorization": f"Bearer {request.headers.get('Authorization').split()[1]}"}

        response = requests.delete(keycloak_delete_url, headers=headers)

        if response.status_code == 204:
            db.session.delete(user)
            db.session.commit()





