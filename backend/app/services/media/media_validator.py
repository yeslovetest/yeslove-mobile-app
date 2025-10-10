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
        if not file or not file.filename:
            abort(400, "No file provided")
        
        # Check extension
        ext = file.filename.rsplit('.', 1)[1].lower()
        if ext not in MediaValidator.ALLOWED_EXTENSIONS:
            abort(400, f"File type {ext} not allowed")
        
        # Check file size
        file.seek(0, 2)  # Seek to end
        size = file.tell()
        file.seek(0)  # Reset
        
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
        if content_type.startswith('image/'):
            try:
                img = Image.open(io.BytesIO(file_content))
                return {'width': img.width, 'height': img.height}
            except:
                return {'width': None, 'height': None}
        return {'width': None, 'height': None}