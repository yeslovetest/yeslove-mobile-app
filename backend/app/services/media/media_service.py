from app.models import Media, db
from flask import abort

class MediaService:
    @staticmethod 
    def store_file(file):
        if not file:
            abort(400, "No file uploaded")

        media = Media(
            content_type=file.content_type,
            content=file.read()
        )

        db.session.add(media)
        db.session.commit()

        return media.id

    @staticmethod
    def get_media(media_id):
        media = Media.query.filter_by(id=media_id).first()
        if not media:
            abort(404, "Media not found")
        return media
