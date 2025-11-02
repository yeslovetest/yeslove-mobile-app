import os
from flask import Response, request
from flask_restx import Namespace, Resource, fields

from app.utils import require_auth

api = Namespace("media", description="API Endpoints")


@api.route("/<string:media_id>")
class GetMedia(Resource):
    @api.doc(
        description="Get media file by ID",
        params={
            'media_id': 'Unique media identifier'
        }
    )
    @api.response(200, 'Media file returned')
    @api.response(404, 'Media not found')
    @api.response(403, 'Access denied')
    def get(self, media_id):
        from app.services.media.media_service import MediaService
        media = MediaService.get_media(media_id)

        return Response(
            media.content,
            mimetype=media.content_type,
            headers={
                "Content-Disposition": f'inline; filename="{media.id}.{media.content_type.split("/")[-1]}"'
            }
        )
    
    @require_auth()
    @api.doc(
        description="Delete media file",
        params={
            'media_id': 'Unique media identifier'
        }
    )
    @api.response(200, 'Media deleted successfully')
    @api.response(404, 'Media not found')
    @api.response(401, 'Unauthorized')
    def delete(self, media_id):
        from app.services.media.media_service import MediaService
        MediaService.delete_media(media_id, request.user_id)
        return {"message": "Media deleted"}, 200


@api.route("/upload")
class UploadMedia(Resource):
    @require_auth()
    @api.doc(
        description="Upload media files for general use",
        params={
            'file': 'Media file to upload',
            'post_id': 'Optional post ID if uploading media for a post'
        }
    )
    @api.response(201, 'Media uploaded successfully')
    @api.response(400, 'Bad request')
    @api.response(401, 'Unauthorized')
    def post(self):
        from app.models import User
        from app.services.media.media_service import MediaService
        file = request.files.get("file")
        post_id = request.form.get("post_id")
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404
        result = MediaService.store_file(file, user.id, post_id)
        return {"media_id": result.get('media_id')}, 201


@api.route("/user/<int:user_id>")
class GetUserMedia(Resource):
    from .media_models import MediaListResponse
    @api.response(200, "Success", MediaListResponse)
    def get(self, user_id):
        from app.services.media.media_service import MediaService
        media_list = MediaService.get_user_media(user_id)
        return {"media": media_list}, 200


@api.route("/bulk-upload")
class BulkUploadMedia(Resource):
    @require_auth()
    def post(self):
        from app.models import User
        from app.services.media.media_service import MediaService
        files = request.files.getlist("file")
        post_id = request.form.get("post_id")
        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "User not found"}, 404
        media_ids = MediaService.store_multiple_files(files, user.id, post_id)
        return {"ids": media_ids}, 201


@api.route("/chat-upload")
class ChatMediaUpload(Resource):
    @require_auth()
    @api.doc(
        description="Upload media files for chat messages (images, videos, audio)",
        params={
            'file': 'Media file to upload (jpg, png, gif, mp4, mov, avi, mp3, wav, m4a, ogg, aac)'
        }
    )
    @api.response(201, 'Media uploaded successfully')
    @api.response(400, 'Bad request - no file or invalid file type')
    @api.response(401, 'Unauthorized')
    def post(self):
        """Upload media for chat messages"""
        from app.services.media.media_service import MediaService
        file = request.files.get("file")
        if not file:
            return {"message": "No file provided"}, 400
        
        media_id = MediaService.store_file(file, request.user_id)
        return {"media_id": media_id}, 201


@api.route("/<string:media_id>/metadata")
class GetMediaMetadata(Resource):
    @api.doc(
        description="Get media file metadata",
        params={
            'media_id': 'Unique media identifier'
        }
    )
    @api.response(200, 'Media metadata')
    @api.response(404, 'Media not found')
    def get(self, media_id):
        from app.services.media.media_service import MediaService
        metadata = MediaService.get_media_metadata(media_id)
        return metadata, 200