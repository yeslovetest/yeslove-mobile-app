from flask import request, current_app
from functools import wraps
from app.logging_setup import setup_logger

logger = setup_logger()

def get_current_user():
    """Get current authenticated user from request"""
    from app.models import User
    user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
    if not user:
        return None, {"message": "User not found"}, 404
    return user, None, None

def with_current_user(f):
    """Decorator to inject current user into route function"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user, error_response, status_code = get_current_user()
        if error_response:
            return error_response, status_code
        return f(user, *args, **kwargs)
    return decorated_function

def get_pagination_params():
    """Extract pagination parameters from request"""
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    return page, per_page

def paginate_query(query, page=None, per_page=None):
    """Apply pagination to SQLAlchemy query"""
    if page is None or per_page is None:
        page, per_page = get_pagination_params()
    
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return {
        "items": paginated.items,
        "pagination": {
            "page": paginated.page,
            "per_page": paginated.per_page,
            "total": paginated.total,
            "total_pages": paginated.pages,
            "has_next": paginated.has_next,
            "has_prev": paginated.has_prev
        }
    }

def safe_neptune_operation(operation_func, *args, **kwargs):
    """Safely execute Neptune operation with error handling"""
    if hasattr(current_app, 'graph_repository'):
        try:
            return operation_func(current_app.graph_repository, *args, **kwargs)
        except Exception as e:
            logger.warning(f"Neptune operation failed: {e}")
            return False
    return False

def extract_jwt_token():
    """Extract JWT token from Authorization header"""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header[7:]  # Remove 'Bearer ' prefix
    return auth_header

def send_notification_to_followers(user, title, body, data, notification_type):
    """Send push notification to user's followers"""
    from app.models import Follow
    from app.services.push_notification_service import PushNotificationService
    
    follower_links = Follow.query.filter_by(followed_id=user.id).all()
    follower_user_ids = [f.follower_id for f in follower_links]
    
    if follower_user_ids:
        try:
            PushNotificationService.send_to_multiple_users(
                user_ids=follower_user_ids,
                title=title,
                body=body,
                data=data,
                notification_type=notification_type
            )
        except Exception as e:
            logger.error(f"Push notification failed: {e}")
            return False
    return True