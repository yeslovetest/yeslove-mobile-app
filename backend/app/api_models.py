from flask_restx import fields

def register_models(api):
    """Register API models for Swagger documentation."""

    models = {}

    # ✅ Login Request Model
    models["login"] = api.model("LoginRequest", {
        "username": fields.String(required=True, description="User's Keycloak username"),
        "password": fields.String(required=True, description="User's Keycloak password"),
    })

    # ✅ Set User Type Model
    models["set_user_type"] = api.model("SetUserTypeRequest", {
        "user_type": fields.String(required=True, description="Choose 'professional' or 'standard'"),
        "license": fields.String(description="License number (for professional users only)"),
        "specialization": fields.String(description="Specialization field (for professional users only)")
    })

    # ✅ Refresh Token Model
    models["refresh_token"] = api.model("RefreshTokenRequest", {
        "refresh_token": fields.String(required=True, description="Valid refresh token")
    })

    # ✅ Logout Request Model (No body needed, only uses headers)
    models["logout"] = api.model("LogoutRequest", {})

    # ✅ Create Post Model
    models["create_post"] = api.model("CreatePostRequest", {
        "content": fields.String(required=True, description="Content of the post"),
    })

    # ✅ Update Profile Model
    models["update_profile"] = api.model("UpdateProfileRequest", {
        "bio": fields.String(description="User's bio"),
        "profile_pic": fields.String(description="Profile picture URL")
    })

    # ✅ Like Post Model
    models["like_post"] = api.model("LikePostRequest", {
        "post_id": fields.Integer(required=True, description="ID of the post to like or unlike"),
    })

    # ✅ Add Comment Model
    models["add_comment"] = api.model("AddCommentRequest", {
        "content": fields.String(required=True, description="Content of the comment"),
    })

    # ✅ Follow/Unfollow Model
    models["follow"] = api.model("FollowUserRequest", {
        "action": fields.String(required=True, description="'follow' to follow, 'unfollow' to unfollow")
    })

    # ✅ Send Message Model
    models["send_message"] = api.model("SendMessageRequest", {
        "receiver_id": fields.Integer(required=True, description="ID of the recipient user"),
        "message": fields.String(required=True, description="Message content")
    })

    # ✅ Fetch Messages Model (No request body needed)
    models["get_messages"] = api.model("GetMessagesRequest", {})

    # ✅ Fetch Profile Model (Path param)
    models["profile"] = api.model("GetProfileRequest", {})

     # ✅ Fetch feed  Model (Path param)
    models["feed"] = api.model("Feed", {})


    # ✅ Fetch Followers Model (Path param)
    models["followers"] = api.model("GetFollowersRequest", {})

    # ✅ Fetch Following Model (Path param)
    models["following"] = api.model("GetFollowingRequest", {})

    return models
