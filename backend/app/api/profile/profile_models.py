from .profile_routes import api
from flask_restx import fields

ContactInfo = api.model("ContactInfo", {
        "name": fields.String(description="User's full name"),
        "email": fields.String(description="Email address"),
        "website": fields.String(description="User's personal website"),
    })

EducationInfo = api.model("EducationInfo", {
        "birthday": fields.String(description="User's birthday"),
        "education": fields.String(description="Education details"),
        "institution": fields.String(description="Institution name"),
        "employment": fields.String(description="Current employment details"),
    })

# ✅ Profile Model (Now using pre-defined nested models)
UserProfile = api.model("UserProfile", {
        "user_id": fields.Integer(description="User's database ID"),
        "username": fields.String(description="User's username"),
        "bio": fields.String(description="User bio"),
        "profile_pic": fields.String(description="Profile picture URL"),
        "user_type": fields.String(description="User type: professional or standard"),
        "user_posts": fields.Integer(description="Number of Posts from User"),
        "user_followers": fields.Integer(description="Number of User followers"),\
        "user_following": fields.Integer(description="Number of other users followed by current User"),
        "contact_info": fields.Nested(ContactInfo),
        "education_info": fields.Nested(EducationInfo),
    })
    
    # ✅ About Model (Fixed incorrect referencing)
AboutResponse = api.model("AboutResponse", {
        "contact": fields.Nested(ContactInfo),
        "education_and_employment": fields.Nested(EducationInfo),
    }, strict=False)

UserQuery = api.model("UserQuery", {
    "username": fields.String(required=True, description="User's username (Required)"),
    "email": fields.String(description="User's email (Optional)"),
    "user_id": fields.Integer(description="User's database ID (Optional)"),
    })
    
UserQueryResponse = api.model("UserQueryResponse", {
        "keycloak_id": fields.String(description="User's Keycloak ID"),
        "user_id": fields.Integer(description="User's database ID"),
    })

ProfileVisibilitySetting = api.model("ProfileVisibilitySetting", {
        "setting_id": fields.String(required=True, description="Unique ID for the setting"),
        "value": fields.String(required=True, description="Visibility value (visible/hidden)"),
        "category": fields.String(required=True, description="Category: 'Contact' or 'Education And Other Information'")
    })

ProfileVisibilitySettings = api.model("ProfileVisibilitySettings", {
        "settings": fields.List(fields.Nested(ProfileVisibilitySetting), description="List of profile visibility settings")
    })

EmailNotificationSetting = api.model("EmailNotificationSetting", {
        "setting_id": fields.String(required=True, description="Unique ID for the setting"),
        "value": fields.Boolean(required=True, description="Notification enabled (true/false)")
    })

EmailNotificationSettings = api.model("EmailNotificationSettings", {
        "settings": fields.List(fields.Nested(EmailNotificationSetting), description="List of email notification settings")
    })

MediaFile = api.model("MediaFile", {
        "uri": fields.String(description="URL of the media file"),
        "type": fields.String(description="Type of the media file: 'image', 'video', etc.")
})

UserPost = api.model('UserPost', {
    'id': fields.Integer(description='Post ID'),
    'author_pic': fields.String(description='URL to author\'s profile picture'),
    'content': fields.String(description='Text content of the post'),
    'image_url': fields.String(description='URL to image in the post'),
    'video_url': fields.String(description='URL to video in the post'),
    'timestamp': fields.String(description='Timestamp of the post in ISO format'),
    'likes': fields.Integer(description='Number of likes'),
    'comments': fields.Integer(description='Number of comments'),
    'media_files': fields.List(fields.Nested(MediaFile), description='List of media file URLs associated with the post')  
})

TimelineResponse = api.model('TimelineResponse', 
{
    "total": fields.Integer(description="Total number of posts"),
    "per_page": fields.Integer(description="Number of posts per page"),
    "current_page": fields.Integer(description="Current page number"),
    "posts": fields.List(fields.Nested(UserPost), description="List of posts"),
})



