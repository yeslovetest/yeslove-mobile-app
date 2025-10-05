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


@api.route("/upload")
class UploadMedia(Resource):
    @require_auth()
    def post(self):
        from app.services.media.media_service import MediaService
        file = request.files.get("file")
        media_id = MediaService.store_file(file)
        return {"id": media_id}, 201