from app.models import Media, db
from flask import abort
from datetime import datetime
from .media_validator import MediaValidator
from .media_processor import MediaProcessor, S3Storage
from .security import SecurityService
import uuid

class MediaService:
    @staticmethod 
    @SecurityService.rate_limit_uploads()
    def store_file(file, user_id=None):
        if not file:
            abort(400, "No file uploaded")

        # Validate file
        MediaValidator.validate_file(file)
        
        content = file.read()
        
        # Security scan
        SecurityService.scan_file_content(content)
        
        # Process image if needed
        if file.content_type.startswith('image/'):
            content = MediaProcessor.compress_image(content)
        
        # Extract metadata
        metadata = MediaValidator.extract_image_metadata(content, file.content_type)
        
        # Upload to S3 (optional)
        s3_url = None
        if hasattr(MediaService, '_use_s3') and MediaService._use_s3:
            s3 = S3Storage()
            key = f"media/{uuid.uuid4()}/{file.filename}"
            s3_url = s3.upload_file(content, key, file.content_type)
        
        media = Media(
            content_type=file.content_type,
            content=content if not s3_url else None,  # Store locally or in S3
            filename=file.filename,
            file_size=len(content),
            width=metadata.get('width'),
            height=metadata.get('height'),
            user_id=user_id,
            s3_url=s3_url
        )

        db.session.add(media)
        db.session.commit()

        return media.id

    @staticmethod
    def get_media(media_id, user_id=None):
        media = Media.query.filter_by(id=media_id).first()
        if not media:
            abort(404, "Media not found")
        
        # Check access permissions
        if not SecurityService.check_access_permission(media, user_id):
            abort(403, "Access denied")
        
        return media
    
    @staticmethod
    def delete_media(media_id, user_id):
        media = Media.query.filter_by(id=media_id, user_id=user_id).first()
        if not media:
            abort(404, "Media not found or unauthorized")
        
        db.session.delete(media)
        db.session.commit()
    
    @staticmethod
    def get_user_media(user_id):
        media_list = Media.query.filter_by(user_id=user_id, is_public=True).all()
        return [{
            "id": m.id,
            "filename": m.filename,
            "content_type": m.content_type,
            "file_size": m.file_size,
            "created_at": m.created_at.isoformat() if m.created_at else None
        } for m in media_list]
    
    @staticmethod
    def store_multiple_files(files, user_id):
        if not files:
            abort(400, "No files uploaded")
        
        media_ids = []
        for file in files:
            if file:
                media_id = MediaService.store_file(file, user_id)
                media_ids.append(media_id)
        
        return media_ids
    
    @staticmethod
    def get_media_metadata(media_id):
        media = Media.query.filter_by(id=media_id).first()
        if not media:
            abort(404, "Media not found")
        
        return {
            "id": media.id,
            "filename": media.filename,
            "content_type": media.content_type,
            "file_size": media.file_size,
            "width": media.width,
            "height": media.height,
            "duration": media.duration,
            "created_at": media.created_at.isoformat() if media.created_at else None,
            "is_public": media.is_public
        }
