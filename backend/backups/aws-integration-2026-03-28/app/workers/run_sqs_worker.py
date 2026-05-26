#!/usr/bin/env python3
import signal
import sys
import os
import time
from concurrent.futures import ThreadPoolExecutor
from app.workers.sqs_worker import SQSWorker

class WorkerManager:
    def __init__(self):
        self.worker = SQSWorker()
        self.executor = ThreadPoolExecutor(max_workers=int(os.getenv('SQS_WORKER_CONCURRENCY', 4)))
        self.running = True
        
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print(f"\nReceived signal {signum}, shutting down gracefully...")
        self.running = False
        self.worker.stop()
        
    def start(self):
        """Start worker with signal handling"""
        # Register signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        print("Starting SQS worker...")
        
        try:
            # Submit worker to thread pool
            future = self.executor.submit(self.worker.start)
            
            # Wait for completion or shutdown
            while self.running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("Keyboard interrupt received")
        finally:
            print("Shutting down worker...")
            self.executor.shutdown(wait=True)
            print("Worker stopped")

if __name__ == "__main__":
    # Set up Flask app context
    from app import create_app
    app = create_app()
    
    with app.app_context():
        manager = WorkerManager()
        manager.start()