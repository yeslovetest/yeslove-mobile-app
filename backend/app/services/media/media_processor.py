from PIL import Image
import io
import os
from datetime import timedelta
from urllib.parse import urlparse
from minio import Minio
try:
    from mutagen import File as MutagenFile
except ImportError:
    MutagenFile = None

class MediaProcessor:
    
    @staticmethod
    def resize_image(content, sizes=[(150, 150), (300, 300), (800, 600)]):
        """Generate multiple image sizes"""
        resized_images = {}
        try:
            img = Image.open(io.BytesIO(content))
            for size in sizes:
                resized = img.copy()
                resized.thumbnail(size, Image.Resampling.LANCZOS)
                
                output = io.BytesIO()
                resized.save(output, format='JPEG', quality=85)
                resized_images[f"{size[0]}x{size[1]}"] = output.getvalue()
        except Exception as e:
            print(f"Image resize error: {e}")
        
        return resized_images
    
    @staticmethod
    def compress_image(content, quality=85):
        """Compress image to reduce file size"""
        try:
            img = Image.open(io.BytesIO(content))
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=quality, optimize=True)
            return output.getvalue()
        except:
            return content
    
    @staticmethod
    def extract_media_metadata(content, content_type, filename):
        """Extract metadata from media files"""
        metadata = {'width': None, 'height': None, 'duration': None}
        
        if content_type.startswith('image/'):
            try:
                img = Image.open(io.BytesIO(content))
                metadata.update({'width': img.width, 'height': img.height})
            except:
                pass
        elif MutagenFile and (content_type.startswith('audio/') or content_type.startswith('video/')):
            try:
                # Save temp file for mutagen
                import tempfile
                with tempfile.NamedTemporaryFile(suffix=os.path.splitext(filename)[1]) as tmp:
                    tmp.write(content)
                    tmp.flush()
                    
                    audio_file = MutagenFile(tmp.name)
                    if audio_file and hasattr(audio_file, 'info'):
                        metadata['duration'] = int(audio_file.info.length) if audio_file.info.length else None
            except:
                pass
        
        return metadata

class ObjectStorage:
    def __init__(self):
        self.provider = os.getenv('OBJECT_STORAGE_PROVIDER', 'spaces').lower()
        self.region = os.getenv('OBJECT_STORAGE_REGION', 'lon1')
        self.bucket = os.getenv('OBJECT_STORAGE_BUCKET')
        self.endpoint_url = os.getenv('OBJECT_STORAGE_ENDPOINT_URL')
        self.public_url = os.getenv('OBJECT_STORAGE_PUBLIC_URL')
        self.cdn_domain = os.getenv('OBJECT_STORAGE_CDN_DOMAIN')

        access_key = os.getenv('OBJECT_STORAGE_ACCESS_KEY_ID')
        secret_key = os.getenv('OBJECT_STORAGE_SECRET_ACCESS_KEY')

        endpoint = self._resolve_endpoint()
        secure = not endpoint.startswith("http://")
        endpoint = endpoint.replace("https://", "").replace("http://", "")

        self.client = Minio(
            endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure,
        )
    
    def upload_file(self, content, key, content_type, is_public=True):
        """Upload file to object storage."""
        try:
            self.client.put_object(
                self.bucket,
                key,
                io.BytesIO(content),
                length=len(content),
                content_type=content_type,
            )
            
            if is_public:
                return self.build_public_url(key)
            return key
        except Exception as e:
            print(f"Object storage upload error: {e}")
            return None

    def build_public_url(self, key):
        """Build a public URL for uploaded objects."""
        if self.public_url:
            return f"{self.public_url.rstrip('/')}/{key}"

        if self.cdn_domain:
            return f"https://{self.cdn_domain.rstrip('/')}/{key}"

        if self.provider == 'spaces' and self.bucket and self.region:
            return f"https://{self.bucket}.{self.region}.digitaloceanspaces.com/{key}"

        endpoint_url = self._resolve_endpoint()
        if endpoint_url and self.bucket:
            parsed = urlparse(endpoint_url)
            base = f"{parsed.scheme}://{self.bucket}.{parsed.netloc}" if parsed.scheme and parsed.netloc else ""
            if base:
                return f"{base}/{key}"

        return key
    
    def delete_file(self, key):
        """Delete file from object storage."""
        try:
            self.client.remove_object(self.bucket, key)
            return True
        except:
            return False
    
    def generate_presigned_url(self, key, expiration=3600):
        """Generate temporary URL"""
        try:
            return self.client.presigned_get_object(
                self.bucket,
                key,
                expires=timedelta(seconds=expiration),
            )
        except:
            return None

    def _resolve_endpoint(self):
        if self.endpoint_url:
            return self.endpoint_url
        if self.provider == 'spaces' and self.region:
            return f"https://{self.region}.digitaloceanspaces.com"
        return "http://localhost:9000"


class S3Storage(ObjectStorage):
    """Backward-compatible alias for the legacy storage class name."""
