#!/usr/bin/env python3
"""SQS Worker runner script"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.workers.sqs_worker import SQSWorker

if __name__ == "__main__":
    app = create_app()
    
    with app.app_context():
        worker = SQSWorker()
        print("Starting SQS Worker...")
        worker.start()