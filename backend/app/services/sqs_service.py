import boto3
import json
import os
from flask import current_app
from typing import Dict, Any, Optional

class SQSService:
    def __init__(self):
        self.sqs = boto3.client(
            'sqs',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.queue_url = os.getenv('AWS_SQS_QUEUE_URL')
    
    def send_message(self, message_body: Dict[str, Any], delay_seconds: int = 0) -> bool:
        """Send message to SQS queue"""
        if not self.queue_url:
            current_app.logger.error("SQS queue URL not configured")
            return False
        
        try:
            response = self.sqs.send_message(
                QueueUrl=self.queue_url,
                MessageBody=json.dumps(message_body),
                DelaySeconds=delay_seconds
            )
            return True
        except Exception as e:
            current_app.logger.error(f"SQS send error: {e}")
            return False
    
    def send_notification_job(self, user_ids: list, title: str, body: str, data: Dict[str, Any] = None):
        """Queue push notification job"""
        message = {
            'job_type': 'push_notification',
            'user_ids': user_ids,
            'title': title,
            'body': body,
            'data': data or {}
        }
        return self.send_message(message)
    
    def send_email_job(self, user_id: int, email_type: str, data: Dict[str, Any] = None):
        """Queue email job"""
        message = {
            'job_type': 'send_email',
            'user_id': user_id,
            'email_type': email_type,
            'data': data or {}
        }
        return self.send_message(message)
    
    def send_media_processing_job(self, media_id: str, processing_type: str):
        """Queue media processing job"""
        message = {
            'job_type': 'media_processing',
            'media_id': media_id,
            'processing_type': processing_type
        }
        return self.send_message(message)
    
    def receive_messages(self, max_messages: int = 10) -> list:
        """Receive messages from queue (for worker processes)"""
        if not self.queue_url:
            return []
        
        try:
            response = self.sqs.receive_message(
                QueueUrl=self.queue_url,
                MaxNumberOfMessages=max_messages,
                WaitTimeSeconds=20  # Long polling
            )
            return response.get('Messages', [])
        except Exception as e:
            current_app.logger.error(f"SQS receive error: {e}")
            return []
    
    def delete_message(self, receipt_handle: str) -> bool:
        """Delete processed message from queue"""
        try:
            self.sqs.delete_message(
                QueueUrl=self.queue_url,
                ReceiptHandle=receipt_handle
            )
            return True
        except Exception as e:
            current_app.logger.error(f"SQS delete error: {e}")
            return False