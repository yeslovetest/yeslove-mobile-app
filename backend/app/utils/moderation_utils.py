from app import openai_moderation, perspective
from app.logging_setup import setup_logger

logger = setup_logger()

# Per-label thresholds (tune as needed). Scores are normalised to 0-1 by each provider.
# SEXUAL is set higher because YesLove members legitimately discuss intimacy.
ATTRIBUTE_THRESHOLDS = {
    "HARASSMENT": 0.65,
    "THREAT": 0.5,
    "SEXUAL": 0.75,
    "SEXUAL_MINORS": 0.3,
    "SELF_HARM": 0.5,
}

# Labels that must never auto-remove content. Someone posting about self-harm needs
# support rather than a block, so these are flagged for human review instead.
REVIEW_ONLY_LABELS = {"SELF_HARM"}


def _provider_scores(text: str):
    """Normalised label scores from the first available provider, or None.

    OpenAI moderation is primary. Perspective API is kept as a fallback until
    Google shuts it down on 31 Dec 2026.
    """
    result = openai_moderation.analyze_text(text)
    if result:
        return "openai", openai_moderation.normalise(result), result.get("category_scores")

    result = perspective.analyze_text(
        text,
        attributes={"TOXICITY": {}, "INSULT": {}, "THREAT": {}, "SEXUALLY_EXPLICIT": {}},
    )
    if result:
        return "perspective", perspective.normalise(result), result.get("attributeScores")

    return None


def score_labels(labels: dict) -> dict:
    """Pure scoring step: labels -> flag decision, severity and triggered labels."""
    triggered = {
        label: score
        for label, score in labels.items()
        if score >= ATTRIBUTE_THRESHOLDS.get(label, 1.0)
    }
    highest = max(labels.values(), default=0.0)

    severity = "low"
    if highest >= 0.9:
        severity = "high"
    elif highest >= 0.7:
        severity = "medium"

    # Sexual content involving minors is always the top severity.
    if "SEXUAL_MINORS" in triggered:
        severity = "high"
    # Review-only labels never reach "high" on their own, so they are never auto-removed.
    elif triggered and set(triggered) <= REVIEW_ONLY_LABELS and severity == "high":
        severity = "medium"

    return {
        "is_flagged": bool(triggered),
        "severity": severity,
        "score": highest,
        "triggered": triggered,
    }


def moderate_text(text: str):
    """
    Screen text with the configured moderation provider.
    Returns None when no provider is available, otherwise:
    {
        "is_flagged": True/False,
        "severity": "low"/"medium"/"high",
        "score": float,  # highest label score
        "triggered": {"HARASSMENT": 0.84, ...},
        "attributes": raw provider scores,
        "provider": "openai" / "perspective"
    }
    """
    provider_result = _provider_scores(text)
    if not provider_result:
        return None

    provider, labels, raw = provider_result
    decision = score_labels(labels)
    decision["attributes"] = raw
    decision["provider"] = provider
    return decision

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
