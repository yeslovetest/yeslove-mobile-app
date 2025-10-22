import os
from flask import Response, request
from flask_restx import Namespace, Resource

from app.utils import require_auth

api = Namespace("media", description="API Endpoints")


@api.route("/<string:media_id>")
class GetMedia(Resource):
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
    def delete(self, media_id):
        from app.services.media.media_service import MediaService
        MediaService.delete_media(media_id, request.user_id)
        return {"message": "Media deleted"}, 200


@api.route("/upload")
class UploadMedia(Resource):
    @require_auth()
    def post(self):
        from app.services.media.media_service import MediaService
        file = request.files.get("file")
        media_id = MediaService.store_file(file, request.user_id)
        return {"id": media_id}, 201


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
        from app.services.media.media_service import MediaService
        files = request.files.getlist("files")
        media_ids = MediaService.store_multiple_files(files, request.user_id)
        return {"ids": media_ids}, 201


@api.route("/<string:media_id>/metadata")
class GetMediaMetadata(Resource):
    def get(self, media_id):
        from app.services.media.media_service import MediaService
        metadata = MediaService.get_media_metadata(media_id)
        return metadata, 200