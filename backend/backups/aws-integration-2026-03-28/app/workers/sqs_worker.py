import json
import time
import os
import random
from app.services.sqs_service import SQSService
from app.workers.job_processor import JobProcessor
import logging

logger = logging.getLogger(__name__)

class SQSWorker:
    def __init__(self):
        self.sqs_service = SQSService()
        self.running = False
        self.max_retries = int(os.getenv('SQS_MAX_RETRIES', 5))
        self.dlq_url = os.getenv('SQS_DLQ_URL')
    
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
                    time.sleep(int(os.getenv('SQS_POLL_WAIT', 20)))
                    
            except KeyboardInterrupt:
                logger.info("Worker stopped by user")
                break
            except Exception as e:
                logger.error(f"Worker error: {e}")
                time.sleep(10)
    
    def stop(self):
        """Stop the worker"""
        self.running = False
    
    def process_message(self, message):
        """Process individual SQS message with retry logic"""
        try:
            body = json.loads(message['Body'])
            receive_count = int(message.get('Attributes', {}).get('ApproximateReceiveCount', 1))
            
            # Process job
            success = JobProcessor.process_job(body)
            
            if success:
                self.sqs_service.delete_message(message['ReceiptHandle'])
                logger.info(f"Successfully processed job: {body.get('job_type')}")
            else:
                self.handle_failed_message(message, receive_count)
                
        except Exception as e:
            logger.error(f"Failed to process message: {e}")
            receive_count = int(message.get('Attributes', {}).get('ApproximateReceiveCount', 1))
            self.handle_failed_message(message, receive_count)
    
    def handle_failed_message(self, message, receive_count):
        """Handle failed message with exponential backoff"""
        if receive_count >= self.max_retries:
            # Move to DLQ if configured
            if self.dlq_url:
                self.move_to_dlq(message)
            self.sqs_service.delete_message(message['ReceiptHandle'])
            logger.error(f"Message failed after {self.max_retries} retries, moved to DLQ")
        else:
            # Exponential backoff with jitter
            delay = min(300, (2 ** receive_count) + random.randint(0, 10))
            self.sqs_service.change_message_visibility(message['ReceiptHandle'], delay)
            logger.warning(f"Message retry {receive_count}/{self.max_retries}, delayed {delay}s")
    
    def move_to_dlq(self, message):
        """Move message to dead letter queue"""
        if self.dlq_url:
            try:
                self.sqs_service.send_to_dlq(message['Body'])
            except Exception as e:
                logger.error(f"Failed to move message to DLQ: {e}")
    
