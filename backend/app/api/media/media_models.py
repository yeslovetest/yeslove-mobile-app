from .media_routes import api
from flask_restx import fields

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
