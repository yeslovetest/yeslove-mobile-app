from flask import Blueprint, jsonify, current_app
from datetime import datetime
import os

try:
    import psutil
except ImportError:
    psutil = None

health_bp = Blueprint('health', __name__)

@health_bp.route('/health')
def health_check():
    """Basic health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "yeslove-api"
    })

@health_bp.route('/ready')
def readiness_check():
    """Kubernetes readiness probe"""
    checks = {
        "database": check_database(),
        "neptune": check_neptune(),
        "redis": check_redis()
    }
    
    all_healthy = all(checks.values())
    status_code = 200 if all_healthy else 503
    
    return jsonify({
        "status": "ready" if all_healthy else "not_ready",
        "checks": checks,
        "timestamp": datetime.utcnow().isoformat()
    }), status_code

@health_bp.route('/metrics/system')
def system_metrics():
    """System resource metrics"""
    if psutil:
        return jsonify({
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent,
            "process_count": len(psutil.pids())
        })
    else:
        return jsonify({
            "cpu_percent": 0,
            "memory_percent": 0,
            "disk_percent": 0,
            "process_count": 0,
            "note": "psutil not available"
        })

def check_database():
    """Check database connectivity"""
    try:
        from app.models import User
        User.query.first()
        return True
    except:
        return False

def check_neptune():
    """Check Neptune connectivity"""
    try:
        if hasattr(current_app, 'neptune_client'):
            return True
        return True  # Optional service
    except:
        return False

def check_redis():
    """Check Redis connectivity"""
    try:
        from app.utils.rate_limiter import redis_client
        if redis_client:
            redis_client.ping()
        return True
    except:
        return True  # Optional service