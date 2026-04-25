from app.models import Media, db
from app.logging_setup import setup_logger
from flask import abort
from datetime import datetime
from .media_validator import MediaValidator
from .media_processor import MediaProcessor, S3Storage, SupabaseStorage
from .security import SecurityService
import uuid

logger = setup_logger()

class MediaService:
    @staticmethod
    def _upload_to_cloud(content, content_type, filename, folder='media', allow_s3_fallback=False):
        """Upload to Supabase first, then optionally fall back to S3."""
        key = f"{folder}/{uuid.uuid4()}/{filename}"

        supabase = SupabaseStorage()
        if supabase.is_configured():
            supabase_url = supabase.upload_file(content, key, content_type)
            if supabase_url:
                return supabase_url

        if allow_s3_fallback:
            s3 = S3Storage()
            return s3.upload_file(content, key, content_type)

        return None

    @staticmethod
    @SecurityService.rate_limit_uploads()
    def store_file(file, user_id=None, post_id=None, auto_commit=True):
        from flask import current_app
        
        if not file:
            abort(400, "No file uploaded")
        # ✅ Validate file type, size, etc.
        MediaValidator.validate_file(file)

        content_type = getattr(file, 'content_type', None) or getattr(file, 'mimetype', None) or 'application/octet-stream'
        mimetype = getattr(file, 'mimetype', None) or content_type

        content = file.read()

        if not mimetype.startswith(("image/", "video/")):
            # Skip text-based scanning for images - image binary data might accidentally contain pattern
            # improved scanning for images to be implemented later👈
             # ✅ Security scan
            SecurityService.scan_file_content(content)
    
       
        # ✅ Process image (e.g., compression)
        if content_type.startswith("image/"):
            content = MediaProcessor.compress_image(content)

        # ✅ Extract metadata (width, height, etc.)
        metadata = MediaValidator.extract_image_metadata(content, content_type)

       
        '''
        # Extract metadata
        metadata = MediaProcessor.extract_media_metadata(content, file.content_type, file.filename)
        '''
        
        # Upload to Supabase bucket (preferred) or S3 fallback.
        s3_url = None
        use_cloud_storage = current_app.config.get("USE_S3_STORAGE", False) or SupabaseStorage().is_configured()
        if use_cloud_storage:
            s3_url = MediaService._upload_to_cloud(
                content=content,
                content_type=content_type,
                filename=file.filename,
                folder='media',
                allow_s3_fallback=current_app.config.get("USE_S3_STORAGE", False),
            )

        # ✅ Create and save Media record
        media = Media(
            content_type=content_type,
            content=content if not s3_url else None,  # store locally or use S3
            filename=file.filename,
            file_size=len(content),
            width=metadata.get("width"),
            height=metadata.get("height"),
            duration=metadata.get('duration'),
            user_id=user_id,
            post_id=post_id,
            s3_url=s3_url,
        )

        db.session.add(media)
        if auto_commit:
            db.session.commit()
        else:
            # Flush so callers can use media.id within the same transaction.
            db.session.flush()

        # ✅ Return both ID and URL (local or S3)
        media_url = s3_url or f"/api/media/{media.id}"

        return {
            "media_id": media.id,
            "media_url": media_url
        }

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
        media_list = Media.query.filter_by(user_id=user_id, is_public=True).order_by(Media.created_at.desc()).all()
        return [{
            "id": m.id,
            "url": m.s3_url or f"/api/media/{m.id}",
            "media_url": m.s3_url or f"/api/media/{m.id}",
            "filename": m.filename,
            "content_type": m.content_type,
            "file_size": m.file_size,
            "width": m.width,
            "height": m.height,
            "duration": m.duration,
            "created_at": m.created_at.isoformat() if m.created_at else None
        } for m in media_list]
    
    @staticmethod
    def store_multiple_files(files, user_id, post_id=None):
        if not files:
            abort(400, "No files uploaded")
        
        media_ids = []
        for file in files:
            if file:
                media = MediaService.store_file(file, user_id, post_id)
                media_ids.append(media.get("media_id"))
        
        return media_ids
    
    @staticmethod
    def upload_file(file, user_id, folder='media'):
        """Upload file to cloud storage and return metadata."""
        if not file:
            return None
        
        # Validate file
        MediaValidator.validate_file(file)

        content_type = getattr(file, 'content_type', None) or getattr(file, 'mimetype', None) or 'application/octet-stream'
        
        content = file.read()
    
 
        # ✅ Process image (e.g., compression)
        if content_type.startswith("image/"):
            content = MediaProcessor.compress_image(content)

        # ✅ Extract metadata (width, height, etc.)
        metadata = MediaValidator.extract_image_metadata(content, content_type)
        
        # Process image if needed
        if content_type.startswith('image/'):
            content = MediaProcessor.compress_image(content)
        
        # Extract metadata
        metadata = MediaProcessor.extract_media_metadata(content, content_type, file.filename)
        
        # Upload to Supabase bucket (preferred) or S3 fallback.
        from flask import current_app
        s3_url = None
        use_cloud_storage = current_app.config.get('USE_S3_STORAGE', False) or SupabaseStorage().is_configured()
        if use_cloud_storage:
            s3_url = MediaService._upload_to_cloud(
                content=content,
                content_type=content_type,
                filename=file.filename,
                folder=folder,
                allow_s3_fallback=current_app.config.get('USE_S3_STORAGE', False),
            )
        
        return {
            'id': str(uuid.uuid4()),
            's3_url': s3_url,
            'filename': file.filename,
            'content_type': content_type,
            'file_size': len(content),
            'width': metadata.get('width'),
            'height': metadata.get('height'),
            'duration': metadata.get('duration')
        }
    
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
