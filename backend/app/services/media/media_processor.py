from PIL import Image
import io
import boto3
from flask import current_app
import os
import requests
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

class S3Storage:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.bucket = os.getenv('S3_BUCKET_NAME')
    
    def upload_file(self, content, key, content_type, is_public=True):
        """Upload file to S3"""
        try:
            params = {
                'Bucket': self.bucket,
                'Key': key,
                'Body': content,
                'ContentType': content_type
            }
            
            # Don't use ACL, rely on bucket policy instead
            self.s3.put_object(**params)
            
            if is_public:
                cloudfront_domain = os.getenv('CLOUDFRONT_DOMAIN')
                if cloudfront_domain:
                    return f"https://{cloudfront_domain}/{key}"
                else:
                    return f"https://{self.bucket}.s3.amazonaws.com/{key}"
            else:
                return key  # Return key for private files
        except Exception as e:
            print(f"S3 upload error: {e}")
            return None
    
    def delete_file(self, key):
        """Delete file from S3"""
        try:
            self.s3.delete_object(Bucket=self.bucket, Key=key)
            return True
        except:
            return False
    
    def generate_presigned_url(self, key, expiration=3600):
        """Generate temporary URL"""
        try:
            return self.s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket, 'Key': key},
                ExpiresIn=expiration
            )
        except:
            return None


class SupabaseStorage:
    def __init__(self):
        self.supabase_url = (os.getenv('SUPABASE_URL') or '').rstrip('/')
        self.service_key = (
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
            or os.getenv('SUPABASE_SERVICE_KEY')
            or os.getenv('SUPABASE_ANON_KEY')
            or os.getenv('SUPABASE_PUBLIC_API_KEY')
            or ''
        )
        self.bucket = os.getenv('SUPABASE_STORAGE_BUCKET', 'media')

    def is_configured(self):
        return bool(self.supabase_url and self.service_key and self.bucket)

    def upload_file(self, content, key, content_type):
        """Upload file to a Supabase storage bucket."""
        if not self.is_configured():
            return None

        try:
            upload_url = f"{self.supabase_url}/storage/v1/object/{self.bucket}/{key}"
            headers = {
                'apikey': self.service_key,
                'Authorization': f'Bearer {self.service_key}',
                'Content-Type': content_type,
                # Overwrite if key already exists.
                'x-upsert': 'true',
            }
            response = requests.post(upload_url, headers=headers, data=content, timeout=30)
            if response.status_code >= 400:
                print(f"Supabase upload error {response.status_code}: {response.text}")
                return None

            return f"{self.supabase_url}/storage/v1/object/public/{self.bucket}/{key}"
        except Exception as e:
            print(f"Supabase upload error: {e}")
            return None