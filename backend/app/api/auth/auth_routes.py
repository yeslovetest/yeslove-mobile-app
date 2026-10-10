# ✅ Define the API Namespaces
from flask import current_app, request
from flask_restx import Namespace, Resource
import requests

from app.logging_setup import setup_logger
from app.utils import require_auth, is_valid_email

# Must match the realm's password policy (KeyCloakService/scripts/mfa.py, `harden`) and
# MIN_PASSWORD_LENGTH in frontendmobileapp/constants/password.ts.
MIN_PASSWORD_LENGTH = 12


def password_problem(password, *own_details):
    """Why this password is not acceptable, or None. Mirrors the Keycloak password policy so
    the member gets a clear message instead of a generic failure from Keycloak."""
    if len(password) < MIN_PASSWORD_LENGTH:
        return f"Password must be at least {MIN_PASSWORD_LENGTH} characters."
    if password.lower() in {str(d).lower() for d in own_details if d}:
        return "Password cannot be the same as your username or email."
    return None

logger = setup_logger()



api = Namespace("auth", description="API Endpoints")

AUTH_REQUEST_TIMEOUT = (5, 10)

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

        # Second factor. Keycloak asks for a one-time code from any account that has an
        # authenticator app set up, and gives the same "invalid credentials" answer for a
        # missing code as for a wrong password, so the app offers an optional code box
        # and we pass it straight through. The code is never logged.
        otp = data.get("otp")
        if otp is not None:
            otp = str(otp).strip().replace(" ", "")
            if not (otp.isdigit() and 6 <= len(otp) <= 8):
                return {"message": "The authenticator code should be 6 to 8 digits."}, 400
            payload["otp"] = otp

        try:
            response = requests.post(keycloak_url, data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=AUTH_REQUEST_TIMEOUT)
        except requests.Timeout:
            return {"message": "Sign-in service timed out. Please try again."}, 504
        except requests.RequestException:
            return {"message": "Sign-in service is temporarily unavailable. Please try again."}, 503
        

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

            # Include identity so the client can initialise its session without
            # a separate sync request. Professional onboarding still needs a token.
            token_data.update({
                "keycloak_id": user.keycloak_id,
                "user_id": user.id,
                "user_type": user.user_type,
            })

            # ✅ If user is professional, flag missing details without dropping tokens.
            if user.user_type == "professional":
                professional_details = ProfessionalDetails.query.filter_by(user_id=user.id).first()
                if not professional_details:
                    token_data.update({
                        "message": "Professional details missing. Please provide license and specialization.",
                        "set_professional_details_required": True
                    })

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

        # Keycloak answers a staff account that has no authenticator set up with a bare 500
        # (the one-time-code step cannot run), which is indistinguishable from an outage.
        # Say so, rather than calling it a wrong password.
        if response.status_code >= 500:
            return {"message": "We couldn't sign you in. If you are a member of staff, check that "
                               "two-step verification is set up on your account."}, 503

        logger.error("❌ Invalid login credentials")
        return {"message": "Invalid login credentials"}, response.status_code

def _remove_keycloak_user(base_users_url, user_id, headers):
    """Best-effort removal of a Keycloak user created during a sign-up that then failed.

    Without this a failed sign-up leaves a sign-in with no app account behind, and the
    person cannot try again because the username is taken.
    """
    try:
        response = requests.delete(f"{base_users_url}/{user_id}", headers=headers, timeout=10)
        if response.status_code not in (204, 404):
            logger.error(f"Could not remove half-created Keycloak user {user_id}: {response.status_code}")
    except requests.RequestException as exc:
        logger.error(f"Could not remove half-created Keycloak user {user_id}: {exc}")


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
        username                    = data.get("username")
        # The app does not send a type for ordinary members, so default to "Standard".
        user_type                   = (data.get("user_type") or "Standard").strip()
        is_professional             = user_type.lower() == "professional"

        # Professional only fileds
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
        missing = [k for k in ("email", "confirm_email", "password", "confirm_password", "first_name", "last_name", "username")
                   if not data.get(k)]
        
        if missing:
            logger.warning(f"⚠️ Missing signup fields -> {missing}")
            return {"message" : f"Missing fields: {", ".join(missing)}"}, 400

        problem = password_problem(password, username, email)
        if problem:
            return {"message": problem}, 400
        
        # If user is professional, require license data and consent
        if is_professional:
            prof_missing = [
                k for k in ("license_body", "license_number", "consent_license_data")
                if data.get(k) is None or data.get(k) == ""
            ]
        
            if prof_missing:
                logger.warning(f"⚠️ Missing professional fields → {prof_missing}")
                return { "message" : "Professional users must provide: " + ", ".join(prof_missing)}, 400
        
            if str(consent_license_data).lower() not in ("yes", "true"):
                return {"message" : "You must consent to use and display tour license data."}, 400
        
        # Gets admin access token
        token_url = f"{current_app.config['KEYCLOAK_SERVER_URL']}/realms/master/protocol/openid-connect/token"
        payload = {
            "grant_type" : "password",
            "client_id" : "admin-cli",
            "username" : current_app.config["KEYCLOAK_ADMIN_USER"],
            "password" : current_app.config["KEYCLOAK_ADMIN_PASS"],
        }
        token_response = requests.post(token_url, data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)

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
            "attributes" : {},
            "credentials":[{
                "type":"password",
                "value":password,
                "temporary":False
            }]
        }

        if is_professional:
            user_payload["attributes"].update({
                "license_body": license_body,
                "license_number" : license_number,
                "consent_license_data" : str(consent_license_data)
            })
        
        logger.debug("🔑 Admin token acquired successfully")

        response = requests.post(create_user_url, json=user_payload, headers=headers, timeout=10)

        logger.info(f"🧩 Keycloak create user response → {response.status_code}")

        # Debug and error handling 
        if response.status_code == 201:
            # Fetches the created user's ID
            get_users_url = f"{create_user_url}?username={username}"
            get_response = requests.get(get_users_url, headers=headers, timeout=10)

            if get_response.status_code != 200 or not get_response.json():
                return {"message" : "User created, but failed to retrieve user ID"}, 500
            
            user_id = get_response.json()[0]["id"]

            # Assigns VERIFY_EMAIL as a required action
            verify_email_url = f"{create_user_url}/{user_id}"
            verify_payload = {
                "requiredActions": ["VERIFY_EMAIL"]
            }
            logger.info(f"✅ User {username} created successfully in Keycloak")

            patch_response = requests.put(verify_email_url, json=verify_payload, headers=headers, timeout=10)

            if patch_response.status_code != 204:
                logger.warning(f"⚠️ Failed to assign VERIFY_EMAIL for user {username}")
                _remove_keycloak_user(create_user_url, user_id, headers)
                return {
                    "message": "User created, but failed to trigger email verification",
                    "details": patch_response.text
                }, patch_response.status_code
            
            # Triggers email validation 
            send_email_url = f"{create_user_url}/{user_id}/send-verify-email"
            send_email_response = requests.put(send_email_url, headers=headers, timeout=10)

            if send_email_response.status_code !=204:
                logger.warning(f"⚠️ Failed to send verification email to {email}")
                _remove_keycloak_user(create_user_url, user_id, headers)
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
                    existing_user.user_type = user_type.lower()
                    new_user = existing_user
                    logger.info(f"✅ Updated existing user {username} with Keycloak ID")
                else:
                    logger.warning(f"⚠️ Signup rejected → Username {username} already exists")
                    _remove_keycloak_user(create_user_url, user_id, headers)
                    return {"message" : "Username already exists"}, 409
            else:
                # Creates a local user row
                new_user = User(
                    keycloak_id  = user_id,
                    username     = username, 
                    email        = email,
                    user_type = user_type.lower()
                )
                db.session.add(new_user)
            
            try:
                db.session.flush()

                # Creates a professional user row
                if is_professional:
                    prof = ProfessionalDetails(
                        user_id=new_user.id,
                        license_body=license_body,
                        license_number=license_number,
                        consent_license_data=(str(consent_license_data).lower() in ("yes", "true"))
                    )
                    db.session.add(prof)

                db.session.commit()
            
            except IntegrityError as e:
                db.session.rollback()
                logger.error(f"❌ Database error when saving user {username}: {e}")
                _remove_keycloak_user(create_user_url, user_id, headers)
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
            logger.error(f"Keycloak create user failed: {response.status_code} {response.text}")
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
            timeout=10,
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
        data = request.get_json(silent=True) or {}
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

        try:
            response = requests.post(keycloak_url, data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=AUTH_REQUEST_TIMEOUT)
        except requests.Timeout:
            return {"message": "Session refresh timed out. Please try again."}, 504
        except requests.RequestException:
            return {"message": "Sign-in service is temporarily unavailable. Please try again."}, 503

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

        problem = password_problem(new_password, user.username, user.email)
        if problem:
            return {"message": problem}, 400

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

        response = requests.put(keycloak_admin_url, json=payload, headers=headers, timeout=10)

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

        response = requests.post(keycloak_reset_url, json=payload, timeout=10)

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
        """Delete the account and everything the app holds about it."""
        from app.models import User
        from app.services.account_service import (
            AccountErasureBlocked, AccountService, delete_keycloak_user,
        )

        if (request.get_json(silent=True) or {}).get("confirmation") is not True:
            return {"message": "Confirmation is required to delete the account"}, 400

        keycloak_id = request.user["keycloak_id"]
        user = User.query.filter_by(keycloak_id=keycloak_id).first()
        if not user:
            return {"message": "User not found"}, 404

        # Refuse before touching anything if the account cannot be erased automatically.
        try:
            AccountService.check_erasable(user)
        except AccountErasureBlocked as exc:
            return {"message": str(exc)}, 409

        username = user.username
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.split()[1] if len(auth_header.split()) == 2 else auth_header

        # Remove the sign-in first so the person cannot log back in while data is erased.
        deleted, status = delete_keycloak_user(keycloak_id, fallback_token=token)
        if not deleted:
            logger.error("Keycloak deletion failed for account %s (%s)", username, status)
            return {"message": "Failed to delete account"}, status if status >= 400 else 500

        try:
            counts, object_keys = AccountService.erase_user_data(user)
        except Exception:
            from app.models import db
            db.session.rollback()
            logger.exception("Sign-in removed but data erasure failed for keycloak id %s", keycloak_id)
            return {
                "message": "Your sign-in was removed but we could not finish deleting your data. "
                           "Please contact support so we can complete it."
            }, 500

        AccountService.remove_external_copies(keycloak_id, object_keys)
        logger.info("Account erased for keycloak id %s: %s", keycloak_id, counts)
        return {"message": "Account delete successful"}, 200


@api.route("/export_data")
class ExportData(Resource):
    @require_auth()
    @api.doc(security='Bearer', description="Download a copy of the personal data held about the signed-in member")
    def get(self):
        """Export the signed-in member's personal data as JSON."""
        import json
        from flask import Response
        from app.models import User
        from app.services.account_service import AccountService

        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404

        payload = AccountService.export_user_data(user)
        logger.info("Data export generated for keycloak id %s", user.keycloak_id)
        return Response(
            json.dumps(payload, indent=2, default=str),
            mimetype="application/json",
            headers={"Content-Disposition": 'attachment; filename="yeslove-my-data.json"'},
        )



