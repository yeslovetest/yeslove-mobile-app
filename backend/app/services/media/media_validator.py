from flask import abort
from PIL import Image
import io


class MediaValidator:
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'mp3', 'wav', 'm4a', 'ogg', 'aac'}
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_AUDIO_SIZE = 25 * 1024 * 1024  # 25MB
    
    @staticmethod
    def validate_file(file):
        filename = getattr(file, "filename", None)
        if not file or not filename:
            abort(400, "No file provided")

        # Check extension safely and fall back to MIME type when needed.
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else None
        if not ext:
            mimetype = (getattr(file, "mimetype", None) or getattr(file, "content_type", "")).lower()
            mime_to_ext = {
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'image/png': 'png',
                'image/gif': 'gif',
                'video/mp4': 'mp4',
                'video/quicktime': 'mov',
                'video/x-msvideo': 'avi',
                'audio/mpeg': 'mp3',
                'audio/mp3': 'mp3',
                'audio/wav': 'wav',
                'audio/x-wav': 'wav',
                'audio/mp4': 'm4a',
                'audio/ogg': 'ogg',
                'audio/aac': 'aac',
            }
            ext = mime_to_ext.get(mimetype)

        if not ext:
            abort(400, "Unable to determine file type")

        if ext not in MediaValidator.ALLOWED_EXTENSIONS:
            abort(400, f"File type {ext} not allowed")

        # Check file size
        try:
            file.seek(0, 2)  # Seek to end
            size = file.tell()
            file.seek(0)  # Reset
        except Exception:
            abort(400, "Unable to read uploaded file")
        
        if ext in {'jpg', 'jpeg', 'png', 'gif'}:
            max_size = MediaValidator.MAX_IMAGE_SIZE
        elif ext in {'mp3', 'wav', 'm4a', 'ogg', 'aac'}:
            max_size = MediaValidator.MAX_AUDIO_SIZE
        else:
            max_size = MediaValidator.MAX_FILE_SIZE
            
        if size > max_size:
            abort(400, f"File too large. Max size: {max_size // (1024*1024)}MB")
        
        return True
    
    @staticmethod
    def extract_image_metadata(file_content, content_type):
        if (content_type or '').startswith('image/'):
            try:
                img = Image.open(io.BytesIO(file_content))
                return {'width': img.width, 'height': img.height}
            except:
                return {'width': None, 'height': None}
        return {'width': None, 'height': None}