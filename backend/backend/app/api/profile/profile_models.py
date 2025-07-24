from .profile_routes import api
from flask_restx import fields

ContactInfo = api.model("ContactInfo", {
        "name": fields.String(description="User's full name"),
        "email": fields.String(description="Email address"),
        "phone": fields.String(description="Phone number"),
        "address": fields.String(description="User's address"),
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
        "username": fields.String(description="User's username"),
        "bio": fields.String(description="User bio"),
        "profile_pic": fields.String(description="Profile picture URL"),
        "user_type": fields.String(description="User type: professional or standard"),
        "contact_info": fields.Nested(ContactInfo),
        "education_info": fields.Nested(EducationInfo),
    })
    
    # ✅ About Model (Fixed incorrect referencing)
AboutResponse = api.model("AboutResponse", {
        "contact": fields.Nested(ContactInfo),
        "education_and_employment": fields.Nested(EducationInfo),
    }, strict=False)

UserQuery = api.model("UserQuery", {
    "username": fields.String(required=True, descriptions="User's username (Required)"),
    "email": fields.String(description="User's email (Optional)"),
    "user_id": fields.Integer(description="User's database ID (Optional)"),
    })
    
UserQueryResponse = api.model("UserQueryResponse", {
        "keycloak_id": fields.String(description="User's Keycloak ID")
    })

ProfileVisibilitySettings = api.model("ProfileVisibilitySettings", {
        "setting_id": fields.String(required=True, description="Unique ID for the setting"),
        "value": fields.String(required=True, description="Visibility value (visible/hidden)"),
        "category": fields.String(required=True, description="Category: 'Contact' or 'Education And Other Information'")
    })

EmailNotificationSettings = api.model("EmailNotificationSettings", {
        "setting_id": fields.String(required=True, description="Unique ID for the setting"),
        "value": fields.Boolean(required=True, description="Notification enabled (true/false)")
    })


