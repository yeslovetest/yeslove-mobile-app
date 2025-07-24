from flask import request
from flask_restx import Namespace, Resource

from app.logging_setup import logger

from app.utils import require_auth



api = Namespace("profile", description="API Endpoints")


@api.route("/profile/<string:keycloak_id>")
class UserProfile(Resource):
    from app.api.profile.profile_models import UserProfile
    @require_auth()
    @api.response(200, "Success", UserProfile)  # ✅ Ensure correct model
    def get(self, keycloak_id):
        
        
        """Get user profile."""
        logger.info(f"🔹 Fetching profile for Keycloak ID: {keycloak_id}")
        
        from app.models import User
        user = User.query.filter_by(keycloak_id=keycloak_id).first()

        if not user:
            logger.warning(f"❌ User with Keycloak ID {keycloak_id} not found")
            return {"message": "User not found"}, 404

        # ✅ Ensure all fields are JSON-serializable
        response_data = {
            "username": user.username or "",
            "bio": user.bio or "",
            "profile_pic": user.profile_pic or "",
            "user_type": user.user_type or "standard",
            "contact_info": {
                "name": user.username or "",
                "email": user.email or "",
                "phone": getattr(user, 'phone', None) or "",
                "address": getattr(user, 'address', None) or "",
                "website": getattr(user, 'website', None) or "",
            },
            "education_info": {
                "birthday": getattr(user, 'birthday', None) or "",
                "education": getattr(user, 'education', None) or "",
                "institution": getattr(user, 'institution', None) or "",
                "employment": getattr(user, 'employment', None) or "",
            }
        }

        # 🔹 Log the response structure
        logger.info(f"✅ Response Data: {response_data}")

        # ✅ Return the response as a dictionary (DO NOT use `jsonify`)
        return response_data, 200


@api.route("/update_profile")
class UpdateProfile(Resource):
    from app.api.profile.profile_models import UserProfile
    @require_auth()
    @api.expect(UserProfile)  # ✅ Attach model
    def put(self):
        """Update user profile."""
        data = request.json
        
        from app.models import User, db
        user = User.query.filter_by(email=request.user["email"]).first()

        if not user:
            return {"message": "User not found"}, 404

        user.bio = data.get("bio", user.bio)
        user.profile_pic = data.get("profile_pic", user.profile_pic)
        db.session.commit()
        return {"message": "Profile updated successfully"}, 200
    
    
@api.route("/about/<string:keycloak_id>")
class About(Resource):
    from app.api.profile.profile_models import AboutResponse
    @require_auth()
    @api.response(200, model=AboutResponse, description='')  # ✅ Attach model
    def get(self, keycloak_id):
        """Get user contact & education details for About section."""
        
        from app.models import User, ProfessionalDetails
        user = User.query.filter_by(keycloak_id=keycloak_id).first()
        if not user:
            return {"message": "User not found"}, 404

        professional_details = ProfessionalDetails.query.filter_by(user_id=user.id).first()

        response_data = {
            "contact": {
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "phone": user.phone if hasattr(user, "phone") else None,
                "address": user.address if hasattr(user, "address") else None,
                "website": user.website if hasattr(user, "website") else None,
            },
            "education_and_employment": {
                "birthday": user.birthday.isoformat() if hasattr(user, "birthday") else None,
                "education": professional_details.education if professional_details else None,
                "institution": professional_details.institution if professional_details else None,
                "employment": professional_details.employment if professional_details else None,
            }
        }
        return response_data, 200
    
@api.route("/user/keycloak_id")
class GetUserKeycloakIDFlexible(Resource):
    from app.api.profile.profile_models import UserQuery, UserQueryResponse
    @require_auth()
    @api.expect(UserQuery)  # ✅ Require Authorization Header
    @api.response(200, "Success", UserQueryResponse)  # ✅ Ensure correct model
    def post(self):
        """Retrieve a user's Keycloak ID by username (required), with optional email or user ID."""
        from app.models import User
        data = request.json
        username = data.get("username")
        email = data.get("email")
        user_id = data.get("user_id")

        logger.info(f"🔍 User Keycloak ID Lookup initiated by {request.user['username']}")

        # ✅ Enforce username requirement
        if not username:
            logger.warning("❌ Missing required parameter: username")
            return {"message": "Username is required"}, 400

        # ✅ Build the query dynamically
        query = User.query.filter_by(username=username)
        log_filters = {"username": username}

        if email:
            query = query.filter_by(email=email)
            log_filters["email"] = email
        if user_id:
            query = query.filter_by(id=user_id)
            log_filters["user_id"] = user_id

        logger.info(f"🔹 Querying database with filters: {log_filters}")

        user = query.first()

        if not user:
            logger.warning(f"❌ User not found with filters: {log_filters}")
            return {"message": "User not found"}, 404

        logger.info(f"✅ Found user: {user.username} (Keycloak ID: {user.keycloak_id})")

        return {"keycloak_id": user.keycloak_id}, 200

@api.route("/profile_visibility")
class ProfileVisibility(Resource):
    @require_auth()
    def get(self):
        """Get profile visibility settings."""
        from app.models import ProfileVisibilitySettings
        user_id = request.user["keycloak_id"]
        settings = ProfileVisibilitySettings.query.filter_by(user_id=user_id).all()
        return [{"setting_id": s.setting_id, "value": s.value, "category": s.category} for s in settings], 200

    from app.api.profile.profile_models import ProfileVisibilitySettings
    @require_auth()
    @api.expect(ProfileVisibilitySettings)
    def post(self):
        """Update profile visibility settings."""
        from app.models import ProfileVisibilitySettings, db
        data = request.json
        user_id = request.user["keycloak_id"]

        for setting in data.get("settings", []):
            setting_id = setting["setting_id"]
            value = setting["value"]
            category = setting["category"]

            existing_setting = ProfileVisibilitySettings.query.filter_by(user_id=user_id, setting_id=setting_id).first()
            if existing_setting:
                existing_setting.value = value
            else:
                new_setting = ProfileVisibilitySettings(user_id=user_id, setting_id=setting_id, value=value, category=category)
                db.session.add(new_setting)

        db.session.commit()
        return {"message": "Profile visibility settings updated"}, 200

# -------------------------
# 🚀 EMAIL NOTIFICATION SETTINGS
# -------------------------

@api.route("/email_notifications")
class EmailNotifications(Resource):
    @require_auth()
    def get(self):
        """Get email notification settings."""
        from app.models import EmailNotificationSettings
        user_id = request.user["keycloak_id"]
        settings = EmailNotificationSettings.query.filter_by(user_id=user_id).all()
        return [{"setting_id": s.setting_id, "value": s.value} for s in settings], 200

    from app.api.profile.profile_models import EmailNotificationSettings
    @require_auth()
    @api.expect(EmailNotificationSettings)
    def post(self):
        """Update email notification settings."""
        from app.models import EmailNotificationSettings, db
        data = request.json
        user_id = request.user["keycloak_id"]

        for setting in data.get("settings", []):
            setting_id = setting["setting_id"]
            value = setting["value"]

            existing_setting = EmailNotificationSettings.query.filter_by(user_id=user_id, setting_id=setting_id).first()
            if existing_setting:
                existing_setting.value = value
            else:
                new_setting = EmailNotificationSettings(user_id=user_id, setting_id=setting_id, value=value)
                db.session.add(new_setting)

        db.session.commit()
        return {"message": "Email notification settings updated"}, 200

