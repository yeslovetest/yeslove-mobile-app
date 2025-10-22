from .media_routes import api
from flask_restx import fields

MediaFile = api.model("MediaFile", {
        "id": fields.String(description="Unique media ID"),
        "url": fields.String(description="Media URL (local or S3)"),    
        "filename": fields.String(description="Original filename"),
        "content_type": fields.String(description="MIME type of the media"),
        "file_size": fields.Integer(description="Size of the file in bytes"),
        "created_at": fields.String(description="Timestamp when the media was uploaded"),
    })

MediaListResponse = api.model("MediaListResponse", {
        "media": fields.List(fields.Nested(MediaFile), description="List of media files")
    })


# Media upload response model
MediaUploadResponse = api.model("MediaUploadResponse", {
    "media_id": fields.String(required=True, description="Unique media identifier")
})

# Media metadata response model
MediaMetadataResponse = api.model("MediaMetadataResponse", {
    "id": fields.String(description="Media ID"),
    "filename": fields.String(description="Original filename"),
    "content_type": fields.String(description="MIME type"),
    "file_size": fields.Integer(description="File size in bytes"),
    "width": fields.Integer(description="Image width (if applicable)"),
    "height": fields.Integer(description="Image height (if applicable)"),
    "duration": fields.Integer(description="Media duration in seconds (if applicable)"),
    "created_at": fields.String(description="Upload timestamp"),
    "is_public": fields.Boolean(description="Public access flag")
})

# Media delete response model
MediaDeleteResponse = api.model("MediaDeleteResponse", {
    "message": fields.String(description="Confirmation message")
})
