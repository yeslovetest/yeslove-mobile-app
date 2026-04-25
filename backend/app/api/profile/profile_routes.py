from flask import current_app, request
from flask_restx import Namespace, Resource
from typing import Dict, Any
import json

from app.logging_setup import setup_logger
from app.utils import require_auth

logger = setup_logger()

api = Namespace("profile", description="API Endpoints")


@api.route("/profile/<string:keycloak_id>")
class UserProfile(Resource):
    from app.api.profile.profile_models import UserProfile
    @require_auth()
    @api.doc(security='Bearer')
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
            "user_id": user.id,
            "username": user.username or "",
            "bio": user.bio or "",
            "profile_pic": user.profile_pic_url or "",
            "user_type": user.user_type or "standard",
            "user_posts": len(user.posts),
            "user_followers": len(user.followers),
            "user_following": len(user.following),
            "contact_info": {
                "name": user.username or "",
                "email": user.email or "",
                "phone": getattr(user, 'phone_number', None) or "",
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
    @api.doc(security='Bearer')
    @api.expect(UserProfile, validate=False)  # Accept JSON and multipart payloads.
    def put(self):
        """Update user profile."""
        data = request.get_json(silent=True) or {}

        if not data and request.form:
            data = request.form.to_dict(flat=True)
            contact_info_raw = data.get("contact_info")
            if isinstance(contact_info_raw, str):
                try:
                    data["contact_info"] = json.loads(contact_info_raw)
                except ValueError:
                    data["contact_info"] = None
        
        from app.models import User, db
        # Type hint for request.user added by @require_auth decorator
        user_data: Dict[str, Any] = getattr(request, 'user', {})
        keycloak_id = user_data.get("keycloak_id") or user_data.get("sub")
        user = User.query.filter_by(keycloak_id=keycloak_id).first() if keycloak_id else None
        if not user and user_data.get("email"):
            user = User.query.filter_by(email=user_data.get("email")).first()

        if not user:
            return {"message": "User not found"}, 404

        user.bio = data.get("bio", user.bio)
        new_userinfo = data.get("contact_info", None)
        logger.info(f"✅ sent Data: {new_userinfo}")
        if new_userinfo:
            # To do: 👇 updating of username and email might require KeyCloak
            #user.username = new_userinfo['name']
            #user.email = new_userinfo['email']
            user.phone_number = new_userinfo['phone']
            user.address = new_userinfo['address']
            user.website = new_userinfo['website']
        
        # Handle profile picture upload to S3 or to local storage
        if 'profile_pic' in request.files:
            from app.services.media.media_service import MediaService
            if current_app.config.get("USE_S3_STORAGE", False):
                try:
                    upload_result = MediaService.upload_file(
                        file=request.files['profile_pic'],
                        user_id=user.id,
                        folder='profiles'
                    )
                    user.profile_pic_url = upload_result.get('s3_url') if upload_result else None
                except Exception as e:
                    logger.error(f"Profile pic upload failed: {e}")
            else:
                result = MediaService.store_file(file=request.files['profile_pic'], user_id=user.id)
                file_url = result.get("media_url")
                user.profile_pic_url = file_url

        db.session.commit()
        return {"message": "Profile updated successfully"}, 200
    
    
@api.route("/about/<string:keycloak_id>")
class About(Resource):
    from app.api.profile.profile_models import AboutResponse
    @require_auth()
    @api.doc(security='Bearer')
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
    
# @api.route("/user/keycloak_id")
# class GetUserKeycloakIDFlexible(Resource):
#     from app.api.profile.profile_models import UserQuery, UserQueryResponse
#     @require_auth()
#     @api.doc(security='Bearer')
#     @api.expect(UserQuery)  # ✅ Require Authorization Header
#     @api.response(200, "Success", UserQueryResponse)  # ✅ Ensure correct model
#     def post(self):
#         """Retrieve a user's Keycloak ID by username (required), with optional email or user ID."""
#         from app.models import User
#         data = request.json or {}
#         username = data.get("username")
#         email = data.get("email")
#         user_id = data.get("user_id")

#         user_data: Dict[str, Any] = getattr(request, 'user', {})
#         logger.info(f"🔍 User Keycloak ID Lookup initiated by {user_data.get('username', 'unknown')}")

#         # ✅ Enforce username requirement
#         if not username:
#             logger.warning("❌ Missing required parameter: username")
#             return {"message": "Username is required"}, 400

#         # ✅ Build the query dynamically
#         query = User.query.filter_by(username=username)
#         log_filters = {"username": username}

#         if email:
#             query = query.filter_by(email=email)
#             log_filters["email"] = email
#         if user_id:
#             query = query.filter_by(id=user_id)
#             log_filters["user_id"] = user_id

#         logger.info(f"🔹 Querying database with filters: {log_filters}")

#         user = query.first()

#         if not user:
#             logger.warning(f"❌ User not found with filters: {log_filters}")
#             return {"message": "User not found"}, 404

#         logger.info(f"✅ Found user: {user.username} (Keycloak ID: {user.keycloak_id})")

#         return {"keycloak_id": user.keycloak_id, "user_id": user.id}, 200

@api.route("/user/keycloak_id")
class GetUserKeycloakID(Resource):
    @require_auth()
    @api.doc(security='Bearer')
    def post(self):
        """
        Return authenticated user's Keycloak ID directly from JWT.
        This endpoint must NOT depend on database state.
        """

        user_data = getattr(request, "user", None)

        if not user_data:
            logger.error("❌ request.user missing after authentication")
            return {"message": "Unauthorized"}, 401

        keycloak_id = user_data.get("sub") or user_data.get("keycloak_id")
        username = user_data.get("preferred_username") or user_data.get("username")
        email = user_data.get("email")


        if not keycloak_id:
            logger.error("❌ Keycloak ID missing in token payload")
            return {"message": "Invalid token"}, 401

        logger.info(f"✅ Authenticated user resolved from JWT: {username} ({keycloak_id})")

        return {
            "keycloak_id": keycloak_id,
            "username": username,
            "email": email
        }, 200


@api.route("/profile_visibility")
class ProfileVisibility(Resource):
    from app.api.profile.profile_models import ProfileVisibilitySettings
    @require_auth()
    @api.doc(security='Bearer')
    @api.response(200, "Success", ProfileVisibilitySettings)  
    def get(self):
        """Get profile visibility settings."""
        from app.models import ProfileVisibilitySettings
        user_data: Dict[str, Any] = getattr(request, 'user', {})
        user_id = user_data.get("keycloak_id")
        settings = ProfileVisibilitySettings.query.filter_by(user_id=user_id).all()
        return {'settings' :
                [{"setting_id": s.setting_id, 
                  "value": s.value, 
                  "category": s.category} for s in settings]}, 200

    from app.api.profile.profile_models import ProfileVisibilitySettings
    @require_auth()
    @api.doc(security='Bearer')
    @api.expect(ProfileVisibilitySettings)
    def post(self):
        """Update profile visibility settings."""
        from app.models import ProfileVisibilitySettings, db
        data = request.json or {}
        user_data: Dict[str, Any] = getattr(request, 'user', {})
        user_id = user_data.get("keycloak_id")

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
    from app.api.profile.profile_models import EmailNotificationSettings
    @require_auth()
    @api.doc(security='Bearer')
    @api.response(200, "Success", EmailNotificationSettings)
    def get(self):
        """Get email notification settings."""
        from app.models import EmailNotificationSettings
        user_data: Dict[str, Any] = getattr(request, 'user', {})
        user_id = user_data.get("keycloak_id")
        settings = EmailNotificationSettings.query.filter_by(user_id=user_id).all()
        return {'settings': [{"setting_id": s.setting_id, "value": s.value} for s in settings]}, 200

    from app.api.profile.profile_models import EmailNotificationSettings
    @require_auth()
    @api.doc(security='Bearer')
    @api.expect(EmailNotificationSettings)
    def post(self):
        """Update email notification settings."""
        from app.models import EmailNotificationSettings, db
        data = request.json or {}
        user_data: Dict[str, Any] = getattr(request, 'user', {})
        user_id = user_data.get("keycloak_id")

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


# -------------------------
# TimeLine
# -------------------------
@api.route('/timeline/<string:keycloak_id>')
class UserTimeline(Resource):
    from .profile_models import TimelineResponse
    @require_auth()
    @api.param("page", "Page number for pagination", type='integer', default=1)
    @api.param("per_page", "Number of posts per page", type='integer', default=20)
    @api.response(code=200, description="Timeline response containing user post with pagination", model=TimelineResponse)
    def get(self, keycloak_id):
        '''
        retrieve all posts authored by a particular user to  displayed on timeline
        '''
        from app.models import Post, User, Reaction
        user = User.query.filter_by(keycloak_id=keycloak_id).first()
        if not user:
            return {"message": "User not found"}, 404

        viewer = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()

        # Pagination parameters
        try:
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 20))
        except ValueError:
            page = 1
            per_page = 20

        if page < 1:
            page = 1
        if per_page < 1:
            per_page = 20

        timeline_query = Post.query.filter_by(user_id=user.id, is_anonymous=False)

        # Total posts
        total_posts = timeline_query.count()

        # Paginated query
        posts = (
            timeline_query
            .order_by(Post.timestamp.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )

        post_ids = [post.id for post in posts]
        reaction_map = {}
        if viewer and post_ids:
            reactions = Reaction.query.filter(
                Reaction.post_id.in_(post_ids),
                Reaction.user_id == viewer.id
            ).all()
            reaction_map = {reaction.post_id: reaction for reaction in reactions}

        data =  [{
            "id": post.id,
            "author": post.author.username if not post.is_anonymous else 'Anonymous User',
            "author_id": post.author.keycloak_id if not post.is_anonymous else None,
            "author_pic": post.author.profile_pic_url if not post.is_anonymous else None,
            "content": post.content,
            "image": post.image_url,
            "image_url": post.image_url,
            "video_url": post.video_url,
            "timestamp": post.timestamp.isoformat(),
            "likes": len(post.likes),
            "comments": len(post.comments),
            "media_files": [
                {
                    'uri': media.s3_url or f"/api/media/{media.id}",
                    'type': media.content_type,
                }
                for media in post.media_files if post.media_files
            ],
            "current_user_reaction": reaction_map.get(post.id).reaction_type if reaction_map.get(post.id) else None,
        } for post in posts]

        logger.info('list of posts succesfully retrieved')

        return {
            "total": total_posts,
            "per_page": per_page,
            "current_page": page,
            "posts": data,
        }, 200    
       
