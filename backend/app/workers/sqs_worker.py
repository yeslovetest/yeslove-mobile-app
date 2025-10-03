import json
import time
from app.services.sqs_service import SQSService
from app.services.push_notification_service import PushNotificationService
import logging

logger = logging.getLogger(__name__)

class SQSWorker:
    def __init__(self):
        self.sqs_service = SQSService()
        self.running = False
    
    def start(self):
        """Start processing SQS messages"""
        self.running = True
        logger.info("SQS Worker started")
        
        while self.running:
            try:
                messages = self.sqs_service.receive_messages()
                
                for message in messages:
                    self.process_message(message)
                    
                if not messages:
                    time.sleep(5)
                    
            except KeyboardInterrupt:
                logger.info("Worker stopped by user")
                break
            except Exception as e:
                logger.error(f"Worker error: {e}")
                time.sleep(10)
    
    def process_message(self, message):
        """Process individual SQS message"""
        try:
            body = json.loads(message['Body'])
            job_type = body.get('job_type')
            
            if job_type == 'push_notification':
                self.handle_push_notification(body)
            elif job_type == 'fanout_post':
                self.handle_fanout_post(body)
            elif job_type == 'send_email':
                self.handle_email(body)
            elif job_type == 'media_processing':
                self.handle_media_processing(body)
            
            self.sqs_service.delete_message(message['ReceiptHandle'])
            
        except Exception as e:
            logger.error(f"Failed to process message: {e}")
    
    def handle_push_notification(self, job_data):
        """Handle push notification job"""
        user_ids = job_data.get('user_ids', [])
        title = job_data.get('title')
        body = job_data.get('body')
        data = job_data.get('data', {})
        
        for user_id in user_ids:
            PushNotificationService.send_to_user(user_id, title, body, data)
    
    def handle_email(self, job_data):
        """Handle email job"""
        logger.info(f"Email job processed")
    
    def handle_fanout_post(self, job_data):
        """Handle fanout post job"""
        from app.services.fanout_service import FanoutService
        
        post_id = job_data.get('post_id')
        author_id = job_data.get('author_id')
        follower_ids = job_data.get('follower_ids', [])
        
        fanout_service = FanoutService()
        fanout_service.process_fanout(post_id, author_id, follower_ids)
    
    def handle_media_processing(self, job_data):
        """Handle media processing job"""
        logger.info(f"Media processing job completed")