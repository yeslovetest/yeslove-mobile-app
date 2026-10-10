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
        """Handle email job.

        There is no email-sending integration in this codebase yet (no SMTP
        config, no provider client) and nothing currently enqueues a
        'send_email' job — SQSService.send_email_job() has no callers. Rather
        than report success for work that was never done, this fails the job
        so the worker's real retry/DLQ path (see SQSWorker.handle_failed_message)
        surfaces it instead of it silently vanishing. Once an email provider
        is wired up, replace this with the real send and return its result.
        """
        current_app.logger.error(
            f"Email job for email_type={job_data.get('email_type')!r} was not sent: "
            "no email provider is configured in this codebase yet."
        )
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
        """Handle media processing job.

        Nothing currently enqueues a 'media_processing' job — SQSService
        .send_media_processing_job() has no callers. The compression and
        metadata extraction MediaProcessor already provides
        (app/services/media/media_processor.py) run synchronously at upload
        time in media_service.py, outside this queue entirely; the async
        path here (e.g. generating resized variants via
        MediaProcessor.resize_image) has no caller and the Media model has
        no columns to store multiple resized variant URLs yet, so wiring
        this up for real is a feature to design, not a bug to fix here.
        Fails the job instead of reporting success for work that was never
        done, so the worker's real retry/DLQ path surfaces it.
        """
        media_id = job_data.get('media_id')
        processing_type = job_data.get('processing_type')
        current_app.logger.error(
            f"Media processing job for media_id={media_id!r} processing_type={processing_type!r} "
            "was not processed: this job type has no implementation yet."
        )
        return False