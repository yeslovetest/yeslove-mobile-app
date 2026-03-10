# ✅ Define the API Namespaces
from flask import current_app, request
from flask_restx import Namespace, Resource
import requests

from app.logging_setup import setup_logger
from app.utils import require_auth, is_valid_email

logger = setup_logger()



api = Namespace("auth", description="API Endpoints")


@api.route("/sync_user")
class SyncUser(Resource):
    @require_auth()
    @api.doc(security='Bearer')
    def post(self):
        """
        Create or update the local user row from JWT claims.

        Use this once after Supabase login so protected endpoints that rely on
        local DB users can work without Keycloak signup/login.
        """
        from app.models import User, db

        payload = request.get_json(silent=True) or {}
        keycloak_id = request.user.get("keycloak_id")
        email = request.user.get("email") or payload.get("email")
        username = request.user.get("username") or payload.get("username")
        requested_user_type = (payload.get("user_type") or "standard").lower().strip()
        user_type = requested_user_type if requested_user_type in {"standard", "professional"} else "standard"

        if not keycloak_id:
            return {"message": "Missing token subject"}, 400

        # Keep compatibility with schemas that require non-null email.
        if not email:
            email = f"{keycloak_id[:24]}@no-email.local"

        if not username:
            username = email.split("@", 1)[0]

        safe_username = "".join(ch for ch in username if ch.isalnum() or ch in {"_", "."}).strip("._")
        if not safe_username:
            safe_username = "user"
        safe_username = safe_username[:50]

        # Existing user by provider subject.
        user = User.query.filter_by(keycloak_id=keycloak_id).first()
        if user:
            changed = False
            if not user.email and email:
                user.email = email
                changed = True
            if not user.username and safe_username:
                user.username = safe_username
                changed = True
            if user.user_type not in {"standard", "professional"}:
                user.user_type = user_type
                changed = True

            if changed:
                db.session.commit()

            return {
                "message": "User already synced",
                "user_id": user.id,
                "keycloak_id": user.keycloak_id,
                "username": user.username,
                "email": user.email,
            }, 200

        # If email already exists, bind the token subject to that user.
        existing_by_email = User.query.filter_by(email=email).first()
        if existing_by_email:
            existing_by_email.keycloak_id = keycloak_id
            if not existing_by_email.username:
                existing_by_email.username = safe_username
            db.session.commit()
            return {
                "message": "User synced from existing email",
                "user_id": existing_by_email.id,
                "keycloak_id": existing_by_email.keycloak_id,
                "username": existing_by_email.username,
                "email": existing_by_email.email,
            }, 200

        # Guarantee username uniqueness.
        unique_username = safe_username
        counter = 1
        while User.query.filter_by(username=unique_username).first():
            suffix = f"_{counter}"
            unique_username = f"{safe_username[:50 - len(suffix)]}{suffix}"
            counter += 1

        new_user = User(
            keycloak_id=keycloak_id,
            username=unique_username,
            email=email,
            user_type=user_type,
        )
        db.session.add(new_user)
        db.session.commit()

        return {
            "message": "User synced",
            "user_id": new_user.id,
            "keycloak_id": new_user.keycloak_id,
            "username": new_user.username,
            "email": new_user.email,
        }, 201

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

        logger.info(f"Login attempt -> username : {username}, IP : {request.remote_addr}")

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
        

        if response.status_code == 200:

            logger.info("✅ Keycloak login succeeded")

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
                # Check if user exists by username to avoid duplicates
                existing_user = User.query.filter_by(username=user_info.get("preferred_username", username)).first()
                if existing_user:
                    # Update existing user with Keycloak ID
                    existing_user.keycloak_id = user_info["sub"]
                    existing_user.email = user_info.get("email", existing_user.email)
                    existing_user.user_type = user_type
                    user = existing_user
                    logger.info(f"✅ Updated existing user {user.username} with Keycloak ID")
                else:
                    # Create new user
                    logger.info(f"🔹 Creating new user {user_info['preferred_username']} in database...")
                    user = User(
                        keycloak_id=user_info["sub"],
                        username=user_info.get("preferred_username", username),
                        email=user_info.get("email", ""),
                        user_type=user_type
                    )
                    db.session.add(user)
                    logger.info(f"✅ User {user.username} created successfully.")
                
                db.session.commit()

            # ✅ If user is professional, ensure they have details
            if user.user_type == "professional":
                professional_details = ProfessionalDetails.query.filter_by(user_id=user.id).first()
                if not professional_details:
                    return {
                        "message": "Professional details missing. Please provide license and specialization.",
                        "set_professional_details_required": True
                    }, 200

            # Auto-register device token if provided
            device_token = data.get("device_token")
            platform = data.get("platform")
            device_id = data.get("device_id")
            if device_token:
                from app.services.device_token_service import DeviceTokenService
                DeviceTokenService.register_device_token(user.id, device_token, platform, device_id)
                logger.info(f"Device token registered for user {user.username}")
            
            logger.info(f"✅ User {user.username} logged in successfully.")
            return token_data, 200
        
        else:
            logger.warning(f"❌ Keycloak login failed → Status {response.status_code}: {response.text[:100]}...")

        logger.error("❌ Invalid login credentials")
        return {"message": "Invalid login credentials"}, response.status_code

@api.route("/signup")
class Signup(Resource):
    from .auth_models import SignupRequest, SignupResponse
    @api.expect(SignupRequest) 
    @api.response(201, "Success", SignupResponse)
    def post(self):
        "Creates a new KeyCloak user via Admin API"
        data = request.json or {}

        # Core fields
        email                       = data.get("email", "").lower().strip()
        confrim_email               = data.get("confirm_email", "").lower().strip()
        password                    = data.get("password")
        confirm_password            = data.get("confirm_password")
        first_name                  = data.get("first_name")
        last_name                   = data.get("last_name")
        phone_number                = data.get("phone_number")
        username                    = data.get("username")
        user_type                   = data.get("user_type")

        
        # Professional only fileds
        user_type                   = data.get("user_type")
        license_body                = data.get("license_body")
        license_number              = data.get("license_number")
        consent_license_data        = data.get("consent_license_data")
        
        logger.info(f"Signup attempt : {username}, type={user_type}")

        # Rejects malformed emails
        if not is_valid_email(email):
            logger.warning(f"❌ Invalid email format → {email}")
            return {"message" : "Invalid email address"}, 400

        if email != confrim_email:
            logger.warning(f"❌ Email mismatch → {email} != {confrim_email}")
            return {"message" : "Emails do not match"}, 400
        
        if password != confirm_password:
            logger.warning("❌ Password mismatch")
            return {"message" : "Passwords do not match"}, 400

        # Sanity check to ensure all fields have inputs
        missing = [k for k in ("email", "confirm_email", "password", "confirm_password", "first_name", "last_name", "phone_number", "username")
                   if not data.get(k)]
        
        if missing:
            logger.warning(f"⚠️ Missing signup fields -> {missing}")
            return {"message" : f"Missing fields: {", ".join(missing)}"}, 400
        
        # If user is professional, require license data and consent
        if user_type == "Professional":
            prof_missing = [
                k for k in ("license_body", "license_number", "consent_license_data")
                if data.get(k) is None or data.get(k) == ""
            ]
        
            if prof_missing:
                logger.warning(f"⚠️ Missing professional fields → {prof_missing}")
                return { "message" : "Professional users must provide: " + ", ".join(prof_missing)}, 400
        
            if consent_license_data != "Yes":
                return {"message" : "You must consent to use and display tour license data."}, 400
        
        # Gets admin access token
        token_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/realms/master/protocol/openid-connect/token"
        payload = {
            "grant_type" : "password",
            "client_id" : "admin-cli",
            "username" : current_app.config["KEYCLOAK_ADMIN_USER"],
            "password" : current_app.config["KEYCLOAK_ADMIN_PASS"],
        }
        token_response = requests.post(token_url, data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"})

        if token_response.status_code != 200:
            logger.error("❌ Keycloak admin token fetch failed")
            return {"message": "Failed to authenticate with Keycloak"},500
        
        admin_token = token_response.json().get("access_token")

        # Create User
        create_user_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/admin/realms/{current_app.config['KEYCLOAK_REALM_NAME']}/users"
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }

        user_payload = {
            "username":username,
            "email":email,
            "firstName" : first_name,
            "lastName" : last_name,
            "enabled": True,
            "attributes" : {
                "phone_number" : phone_number
            },
            "credentials":[{
                "type":"password",
                "value":password,
                "temporary":False
            }]
        }

        if user_type == "Professional":
            user_payload["attributes"].update({
                "license_body": license_body,
                "license_number" : license_number,
                "consent_license_data" : str(consent_license_data)
            })
        
        logger.debug("🔑 Admin token acquired successfully")

        response = requests.post(create_user_url, json=user_payload, headers=headers)

        logger.info(f"🧩 Keycloak create user response → {response.status_code}")

        # Debug and error handling 
        if response.status_code == 201:
            # Fetches the created user's ID
            get_users_url = f"{create_user_url}?username={username}"
            get_response = requests.get(get_users_url, headers=headers)

            if get_response.status_code != 200 or not get_response.json():
                return {"message" : "User created, but failed to retrieve user ID"}, 500
            
            user_id = get_response.json()[0]["id"]

            # Assigns VERIFY_EMAIL as a required action
            verify_email_url = f"{create_user_url}/{user_id}"
            verify_payload = {
                "requiredActions": ["VERIFY_EMAIL"]
            }
            logger.info(f"✅ User {username} created successfully in Keycloak")

            patch_response = requests.put(verify_email_url, json=verify_payload, headers=headers)

            if patch_response.status_code != 204:
                logger.warning(f"⚠️ Failed to assign VERIFY_EMAIL for user {username}")
                return {
                    "message": "User created, but failed to trigger email verification",
                    "details": patch_response.text
                }, patch_response.status_code
            
            # Triggers email validation 
            send_email_url = f"{create_user_url}/{user_id}/send-verify-email"
            send_email_response = requests.put(send_email_url, headers=headers)

            if send_email_response.status_code !=204:
                logger.warning(f"⚠️ Failed to send verification email to {email}")
                return {
                    "message": "User created and VERIFY_EMAIL action assigned, but failed to send email",
                    "details": send_email_response.text
                }, send_email_response.status_code
            
            from app.models import User, ProfessionalDetails, db
            from sqlalchemy.exc import IntegrityError

            # Check to see if username already taken
            existing_user = User.query.filter_by(username=username).first()
            if existing_user:
                # Update existing user with Keycloak ID if missing
                if not existing_user.keycloak_id:
                    existing_user.keycloak_id = user_id
                    existing_user.email = email
                    existing_user.phone_number = phone_number
                    existing_user.user_type = user_type.lower()
                    new_user = existing_user
                    logger.info(f"✅ Updated existing user {username} with Keycloak ID")
                else:
                    logger.warning(f"⚠️ Signup rejected → Username {username} already exists")
                    return {"message" : "Username already exists"}, 409
            else:
                # Creates a local user row
                new_user = User(
                    keycloak_id  = user_id,
                    username     = username, 
                    email        = email,
                    phone_number = phone_number,
                    user_type = user_type.lower()
                )
                db.session.add(new_user)
            
            try:
                db.session.flush()

                # Creates a professional user row
                if user_type == "Professional":
                    prof = ProfessionalDetails(
                        user_id=new_user.id,
                        license_body=license_body,
                        license_number=license_number,
                        consent_license_data=(consent_license_data in ["yes", True])
                    )
                    db.session.add(prof)

                db.session.commit()
            
            except(IntegrityError):
                db.session.rollback
                logger.error(f"❌ Database error when saving user {username}: {e}")
                return {"message" : "Username already exist"}, 409

            # Auto-register device token if provided during signup
            device_token = data.get("device_token")
            platform = data.get("platform")
            device_id = data.get("device_id")
            if device_token:
                from app.services.device_token_service import DeviceTokenService
                DeviceTokenService.register_device_token(new_user.id, device_token, platform, device_id)
                logger.info(f"Device token registered for new user {username}")
            
            return {"message":"User created in Keycloak and email verification sent"},201
        
        elif response.status_code == 409:
            return {"message":"User already exists"},409
        else:
            print("DEBUG → Keycloak error:", response.status_code, response.text)
            return {"message":"Failed to create user", "details": response.text}, response.status_code
    
@api.route("/logout")
class Logout(Resource):
    from .auth_models import LogoutRequest
    @require_auth()
    @api.doc(security='Bearer')
    @api.expect(LogoutRequest)  # ✅ Attach model
    def post(self):
        """Logout user from Keycloak."""
        auth_header = request.headers.get("Authorization", "")
        # To allow for two different formats (Bearer <Token> and <Token>)
        token = auth_header.split()[1] if len(auth_header.split()) == 2 else auth_header
        keycloak_logout_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/realms/{current_app.config['KEYCLOAK_REALM_NAME']}/protocol/openid-connect/logout"

        response = requests.post(
            keycloak_logout_url,
            headers={"Authorization": f"Bearer {token}"},
        )

        logger.info("User logout attempt via refresh token")

        if response.status_code == 204:
            return {"message" : "Logged out successfully"}, 200
        
        logger.error(f"Logout failed : {response.text}")
        return {"message" : "Logout failed", "details" : response.text}, response.status_code
    

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

        logger.info(f"Token refresh requested")
        if response.status_code == 200:
            return response.json(), 200
        
        logger.error(f"Token refresh failed : {response.status_code}, {response.text}")
        return {"message": "Failed to refresh token"}, response.status_code
    
    
    
@api.route("/set_user_type")
class SetUserType(Resource):
    from .auth_models import SetUserTypeRequest
    @require_auth()
    @api.doc(security='Bearer')
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
    @api.doc(security='Bearer')
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

        auth_header = request.headers.get("Authorization", "")
        # To allow for two different formats (Bearer <Token> and <Token>)
        token = auth_header.split()[1] if len(auth_header.split()) == 2 else auth_header
        headers = {"Authorization": f"Bearer {token}"}

        response = requests.put(keycloak_admin_url, json=payload, headers=headers)

        logger.info(f"Password change requested for user {user.username}")
        
        if response.status_code == 204:
            return {"message": "Password changed successfully"}, 200
        logger.error(f"Password change failed for {user.username} : {response.text}")
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
            "redirect_uri": current_app.config["FRONTEND_URI"],
            "response_type": "code",
            "scope": "openid",
            "kc_action": "UPDATE_PASSWORD",
            "email": email
        }

        response = requests.post(keycloak_reset_url, json=payload)

        logger.info(f"Password reset request for email {email}")

        if response.status_code == 200:
            return {"message": "Password reset email sent"}, 200
        logger.error(f"Password rest failed for {email} : {response.text}")
        return {"message": "Failed to send password reset email"}, response.status_code




# -------------------------
# 🚀 DELETE ACCOUNT (KEYCLOAK)
# -------------------------

@api.route("/delete_account")
class DeleteAccount(Resource):
    from .auth_models import DeleteAccountRequest
    @require_auth()
    @api.doc(security='Bearer')
    @api.expect(DeleteAccountRequest)
    def delete(self):
        """Delete user account via Keycloak API."""
        from app.models import User, db
        user_id = request.user["keycloak_id"]
        user = User.query.filter_by(keycloak_id=user_id).first()
        if not user:
            return {"message": "User not found"}, 404

        keycloak_delete_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/admin/realms/{current_app.config['KEYCLOAK_REALM_NAME']}/users/{user_id}"
        
        auth_header = request.headers.get("Authorization", "")
        # To allow for two different formats (Bearer <Token> and <Token>)
        token = auth_header.split()[1] if len(auth_header.split()) == 2 else auth_header
        headers = {"Authorization": f"Bearer {token}"}

        response = requests.delete(keycloak_delete_url, headers=headers)

        logger.info(f"Account deletion requested for user {user.username}")

        if response.status_code == 204:
            return {"message": "Account delete successful"}, 200
            db.session.delete(user)
            db.session.commit()
            logger.info(f"Account deleted successfully for {user.username}")
        else:
            logger.error(f"Account deletion failed: {response.status_code} - {response.text}")
        return {"message": "Failed to delete account"}, response.status_code




