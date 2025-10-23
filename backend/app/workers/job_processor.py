import json
from app.services.notification_service import NotificationService
from app.services.push_notification_service import PushNotificationService
from flask import current_app

class JobProcessor:
    
    @staticmethod
    def process_job(job_data):
        """Process different job types"""
        job_type = job_data.get('job_type')
        
        if job_type == 'notification':
            return JobProcessor.process_notification(job_data)
        elif job_type == 'notification_batch':
            return JobProcessor.process_notification_batch(job_data)
        elif job_type == 'push_notification':
            return JobProcessor.handle_push_notification(job_data)
        elif job_type == 'fanout_post':
            return JobProcessor.handle_fanout_post(job_data)
        elif job_type == 'send_email':
            return JobProcessor.handle_email(job_data)
        elif job_type == 'media_processing':
            return JobProcessor.handle_media_processing(job_data)
        else:
            current_app.logger.warning(f"Unknown job type: {job_type}")
            return False
    
    @staticmethod
    def process_notification(job_data):
        """Process single notification job"""
        try:
            user_id = job_data.get('user_id')
            title = job_data.get('title')
            body = job_data.get('body')
            notification_type = job_data.get('notification_type', 'general')
            data = job_data.get('data')
            
            NotificationService.create_notification(user_id, title, body, notification_type, data)
            return True
        except Exception as e:
            current_app.logger.error(f"Failed to process notification job: {e}")
            return False
    
    @staticmethod
    def process_notification_batch(job_data):
        """Process batch notification job"""
        try:
            user_ids = job_data.get('user_ids', [])
            title = job_data.get('title')
            body = job_data.get('body')
            notification_type = job_data.get('notification_type', 'general')
            data = job_data.get('data')
            
            PushNotificationService.send_to_multiple_users(user_ids, title, body, data, notification_type)
            return True
        except Exception as e:
            current_app.logger.error(f"Failed to process batch notification job: {e}")
            return False
    
    @staticmethod
    def process_push_notification(job_data):
        """Process push notification job (legacy support)"""
        return JobProcessor.process_notification_batch(job_data)
    
    @staticmethod
    def handle_push_notification(job_data):
        """Handle push notification job"""
        try:
            user_ids = job_data.get('user_ids', [])
            title = job_data.get('title')
            body = job_data.get('body')
            data = job_data.get('data', {})
            notification_type = job_data.get('notification_type', 'general')
            
            for user_id in user_ids:
                PushNotificationService.send_to_user(user_id, title, body, data, notification_type)
            return True
        except Exception as e:
            current_app.logger.error(f"Failed to handle push notification: {e}")
            return False
    
    @staticmethod
    def handle_email(job_data):
        """Handle email job"""
        try:
            current_app.logger.info(f"Email job processed: {job_data.get('email_type')}")
            # TODO: Implement email sending logic
            return True
        except Exception as e:
            current_app.logger.error(f"Failed to handle email job: {e}")
            return False
    
    @staticmethod
    def handle_fanout_post(job_data):
        """Handle fanout post job"""
        try:
            from app.services.fanout_service import FanoutService
            
            post_id = job_data.get('post_id')
            author_id = job_data.get('author_id')
            follower_ids = job_data.get('follower_ids', [])
            
            fanout_service = FanoutService()
            fanout_service.process_fanout(post_id, author_id, follower_ids)
            return True
        except Exception as e:
            current_app.logger.error(f"Failed to handle fanout post: {e}")
            return False
    
    @staticmethod
    def handle_media_processing(job_data):
        """Handle media processing job"""
        try:
            media_id = job_data.get('media_id')
            processing_type = job_data.get('processing_type')
            current_app.logger.info(f"Media processing job completed: {media_id} - {processing_type}")
            # TODO: Implement media processing logic
            return True
        except Exception as e:
            current_app.logger.error(f"Failed to handle media processing: {e}")
            return False