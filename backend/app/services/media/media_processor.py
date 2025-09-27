from PIL import Image
import io
import boto3
from flask import current_app
import os

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