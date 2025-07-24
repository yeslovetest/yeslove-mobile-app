# from app.perspective import analyze_text
# from app.models import ModerationLog
# from app.logging_setup import logger

# def process_moderation(content, user, content_type="post"):
#     score = 0.0
#     status = "visible"
#     log = None

#     try:
#         moderation = moderate_text(content)
#         if moderation and moderation.get("is_flagged"):
#             status = "removed" if moderation.get("severity") == "high" else "flagged"
#             score = moderation.get("score", 0.0)

#             log = ModerationLog(
#                 user_id=user.id,
#                 content_type=content_type,
#                 content=content,
#                 score=score,
#                 severity=moderation.get("severity"),
#                 auto_action=status,
#                 attributes=moderation.get("attributes")
#             )
#     except Exception as e:
#         logger.exception("Moderation failed")

#     return status, score, log

# # Define which attributes to request from Perspective API
# MODERATION_ATTRIBUTES = {
#     "TOXICITY": {},
#     "INSULT": {},
#     "THREAT": {},
#     "SEXUALLY_EXPLICIT": {}
# }

# # Define thresholds per attribute (tune as needed)
# ATTRIBUTE_THRESHOLDS = {
#     "TOXICITY": 0.7,
#     "INSULT": 0.65,
#     "THREAT": 0.5,
#     "SEXUALLY_EXPLICIT": 0.6
# }

# def moderate_text(text: str):
#     """
#     Analyzes text using Perspective API.
#     Returns:
#     {
#         "is_flagged": True/False,
#         "severity": "low"/"medium"/"high",
#         "score": float,  # highest score
#         "triggered": {"INSULT": 0.84, ...},
#         "attributes": {full API response}
#     }
#     """
#     result = analyze_text(text, attributes=MODERATION_ATTRIBUTES)
#     if not result:
#         return None

#     scores = result["attributeScores"]
#     triggered = {}
#     highest = 0.0

#     # Check each attribute
#     for attr, threshold in ATTRIBUTE_THRESHOLDS.items():
#         score = scores.get(attr, {}).get("summaryScore", {}).get("value", 0.0)
#         if score >= threshold:
#             triggered[attr] = score
#         highest = max(highest, score)

#     # Classify severity
#     severity = "low"
#     if highest >= 0.9:
#         severity = "high"
#     elif highest >= 0.7:
#         severity = "medium"

#     return {
#         "is_flagged": bool(triggered),
#         "severity": severity,
#         "score": highest,
#         "triggered": triggered,
#         "attributes": scores
#     }
import os
from datetime import datetime
from app.models import ModerationLog, Post

def is_spammy_content(content):
    return content.count("http") > 2 or content.count("!") > 5

def is_posting_too_fast(user):
    last_post = Post.query.filter_by(user_id=user.id).order_by(Post.timestamp.desc()).first()
    if not last_post:
        return False
    delta = datetime.utcnow() - last_post.timestamp
    return delta.total_seconds() < 10

def process_moderation(content, user, content_type="post"):
    from app.utils.perspective_api import moderate_text

    score = 0.0
    status = "visible"
    log = None

    try:
        moderation = moderate_text(content)
        if moderation and moderation.get("is_flagged"):
            status = "removed" if moderation.get("severity") == "high" else "flagged"
            score = moderation.get("score", 0.0)

            log = ModerationLog(
                user_id=user.id,
                content_type=content_type,
                content=content,
                score=score,
                severity=moderation.get("severity"),
                auto_action=status,
                attributes=moderation.get("attributes")
            )
    except Exception:
        pass

    return status, score, log
