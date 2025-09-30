from prometheus_client import Counter, Histogram, Gauge, Info
import time
from functools import wraps
from flask import request

# Business Metrics
user_registrations = Counter('user_registrations_total', 'Total user registrations', ['user_type'])
user_logins = Counter('user_logins_total', 'Total user logins')
posts_created = Counter('posts_created_total', 'Total posts created')
api_requests = Counter('api_requests_total', 'Total API requests', ['method', 'endpoint', 'status'])
api_request_duration = Histogram('api_request_duration_seconds', 'API request duration', ['method', 'endpoint'])

# System Metrics
active_users = Gauge('active_users_current', 'Currently active users')
neptune_operations = Counter('neptune_operations_total', 'Neptune graph operations', ['operation', 'status'])

def track_user_registration(user_type='standard'):
    """Track user registration"""
    user_registrations.labels(user_type=user_type).inc()

def track_user_login():
    """Track user login"""
    user_logins.inc()

def track_post_creation():
    """Track post creation"""
    posts_created.inc()

def track_neptune_operation(operation, success=True):
    """Track Neptune operations"""
    status = 'success' if success else 'failure'
    neptune_operations.labels(operation=operation, status=status).inc()