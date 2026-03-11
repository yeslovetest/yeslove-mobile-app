from flask import Blueprint, jsonify, current_app
from datetime import datetime
import os

from app.utils import get_auth_provider

try:
    import psutil
except ImportError:
    psutil = None

health_bp = Blueprint('health', __name__)


def _is_env_set(name: str) -> bool:
    return bool((os.getenv(name) or "").strip())


def _supabase_env_status():
    supabase_url_set = _is_env_set("SUPABASE_URL")
    issuer_set = _is_env_set("JWT_ISSUER_URL") or supabase_url_set
    jwks_set = _is_env_set("JWT_JWKS_URL") or supabase_url_set
    anon_or_service_set = any(
        _is_env_set(name)
        for name in (
            "SUPABASE_ANON_KEY",
            "SUPABASE_PUBLIC_API_KEY",
            "SUPABASE_KEY",
            "SUPABASE_SERVICE_ROLE_KEY",
            "SUPABASE_SERVICE_KEY",
        )
    )

    required = {
        "SUPABASE_URL": supabase_url_set,
        "JWT_ISSUER_URL_or_derivable": issuer_set,
        "JWT_JWKS_URL_or_derivable": jwks_set,
        "SUPABASE_ANON_OR_SERVICE_KEY": anon_or_service_set,
    }
    optional = {
        "SUPABASE_SERVICE_ROLE_KEY_or_SUPABASE_SERVICE_KEY": any(
            _is_env_set(name) for name in ("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY")
        )
    }

    return {
        "ready": all(required.values()),
        "required": required,
        "optional": optional,
    }


def _keycloak_env_status():
    required = {
        "KEYCLOAK_SERVER_URL": _is_env_set("KEYCLOAK_SERVER_URL"),
        "KEYCLOAK_REALM_NAME": _is_env_set("KEYCLOAK_REALM_NAME"),
        "KEYCLOAK_CLIENT_ID": _is_env_set("KEYCLOAK_CLIENT_ID"),
        "KEYCLOAK_CLIENT_SECRET": _is_env_set("KEYCLOAK_CLIENT_SECRET"),
    }
    optional = {
        "KEYCLOAK_ADMIN_USER": _is_env_set("KEYCLOAK_ADMIN_USER"),
        "KEYCLOAK_ADMIN_PASS": _is_env_set("KEYCLOAK_ADMIN_PASS"),
    }

    return {
        "ready": all(required.values()),
        "required": required,
        "optional": optional,
    }


def _active_provider_readiness(active_provider: str, supabase_status: dict, keycloak_status: dict):
    if active_provider == "supabase":
        return supabase_status
    return keycloak_status

@health_bp.route('/health')
def health_check():
    """Basic health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "yeslove-api"
    })


@health_bp.route('/health/auth-status')
def auth_status_check():
    """Auth provider status and configuration readiness for deployment debugging."""
    configured_provider = (os.getenv("AUTH_PROVIDER") or "auto").strip().lower() or "auto"
    active_provider = get_auth_provider()

    supabase_status = _supabase_env_status()
    keycloak_status = _keycloak_env_status()
    active_readiness = _active_provider_readiness(active_provider, supabase_status, keycloak_status)

    response = {
        "status": "ready" if active_readiness.get("ready") else "not_ready",
        "auth": {
            "configured_provider": configured_provider,
            "active_provider": active_provider,
            "active_provider_ready": active_readiness.get("ready", False),
            "providers": {
                "supabase": supabase_status,
                "keycloak": keycloak_status,
            },
        },
        "timestamp": datetime.utcnow().isoformat(),
    }

    return jsonify(response), 200 if active_readiness.get("ready") else 503

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