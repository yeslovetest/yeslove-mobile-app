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


