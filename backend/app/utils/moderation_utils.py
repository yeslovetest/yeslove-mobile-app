from app.perspective import analyze_text
from app.logging_setup import setup_logger

logger = setup_logger()

# Define which attributes to request from Perspective API
MODERATION_ATTRIBUTES = {
    "TOXICITY": {},
    "INSULT": {},
    "THREAT": {},
    "SEXUALLY_EXPLICIT": {}
}

# Define thresholds per attribute (tune as needed)
ATTRIBUTE_THRESHOLDS = {
    "TOXICITY": 0.7,
    "INSULT": 0.65,
    "THREAT": 0.5,
    "SEXUALLY_EXPLICIT": 0.6
}

def moderate_text(text: str):
    """
    Analyzes text using Perspective API.
    Returns:
    {
        "is_flagged": True/False,
        "severity": "low"/"medium"/"high",
        "score": float,  # highest score
        "triggered": {"INSULT": 0.84, ...},
        "attributes": {full API response}
    }
    """
    result = analyze_text(text, attributes=MODERATION_ATTRIBUTES)
    if not result:
        return None

    scores = result["attributeScores"]
    triggered = {}
    highest = 0.0

    # Check each attribute
    for attr, threshold in ATTRIBUTE_THRESHOLDS.items():
        score = scores.get(attr, {}).get("summaryScore", {}).get("value", 0.0)
        if score >= threshold:
            triggered[attr] = score
        highest = max(highest, score)

    # Classify severity
    severity = "low"
    if highest >= 0.9:
        severity = "high"
    elif highest >= 0.7:
        severity = "medium"

    return {
        "is_flagged": bool(triggered),
        "severity": severity,
        "score": highest,
        "triggered": triggered,
        "attributes": scores
    }

def handle_content_moderation(content: str, user_id: int, content_type: str):
    """
    Centralized content moderation handler.
    
    Args:
        content: Text content to moderate
        user_id: ID of the user who created the content
        content_type: Type of content ('post', 'comment', 'chat')
    
    Returns:
        dict: {
            "allowed": bool,
            "status": str,  # "visible", "flagged", "removed"
            "score": float,
            "message": str,
            "log": ModerationLog or None
        }
    """
    from app.models import ModerationLog, db
    
    try:
        moderation = moderate_text(content)
        if not moderation:
            return {
                "allowed": True,
                "status": "visible",
                "score": 0.0,
                "message": "Content approved",
                "log": None
            }
        
        if not moderation["is_flagged"]:
            return {
                "allowed": True,
                "status": "visible",
                "score": moderation["score"],
                "message": "Content approved",
                "log": None
            }
        
        # Content is flagged
        severity = moderation["severity"]
        score = moderation["score"]
        
        # Determine action based on severity
        if severity == "high":
            status = "removed"
            auto_action = "blocked"
            allowed = False
            message = "Content was blocked due to harmful language."
        else:
            status = "flagged"
            auto_action = "flagged"
            allowed = True
            message = "Content was flagged for review."
        
        # Create moderation log
        log = ModerationLog(
            user_id=user_id,
            content_type=content_type,
            content=content,
            score=score,
            severity=severity,
            auto_action=auto_action,
            attributes=moderation["attributes"]
        )
        db.session.add(log)
        db.session.commit()
        
        return {
            "allowed": allowed,
            "status": status,
            "score": score,
            "message": message,
            "log": log,
            "triggered": moderation["triggered"]
        }
        
    except Exception as e:
        logger.exception(f"Content moderation failed for {content_type}")
        return {
            "allowed": False,
            "status": "error",
            "score": 0.0,
            "message": "Error during content moderation",
            "log": None
        }

def apply_user_penalties(user_id: int, severity: str):
    """
    Apply penalties to users based on moderation severity.
    
    Args:
        user_id: ID of the user to penalize
        severity: Severity level ('low', 'medium', 'high')
    """
    from app.models import User, db
    
    try:
        user = User.query.get(user_id)
        if not user:
            return
        
        # Add warnings based on severity
        if severity == "high":
            user.warnings += 2
        elif severity == "medium":
            user.warnings += 1
        
        # Check for suspension threshold
        if user.warnings >= 5:
            user.is_suspended = True
            logger.warning(f"User {user.username} suspended after {user.warnings} warnings")
        
        db.session.commit()
        logger.info(f"User {user.username} received penalty for {severity} severity content")
    except Exception as e:
        logger.error(f"Failed to apply penalties to user {user_id}: {e}")
        db.session.rollback()

def check_user_suspension(user_id: int):
    """
    Check if a user is suspended.
    
    Args:
        user_id: ID of the user to check
    
    Returns:
        bool: True if user is suspended
    """
    from app.models import User
    
    try:
        user = User.query.get(user_id)
        return user.is_suspended if user else False
    except Exception as e:
        logger.error(f"Failed to check user suspension for user {user_id}: {e}")
        return False
