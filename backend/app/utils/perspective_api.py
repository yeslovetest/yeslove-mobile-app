# # backend/app/perspective.py
# import os
# import requests
# from app.logging_setup import logger

# API_KEY = os.getenv("PERSPECTIVE_API_KEY")

# def analyze_text(text, *, languages=None, attributes=None):
#     """Send text to Perspective API and return the response JSON."""
#     if not API_KEY:
#         raise RuntimeError("PERSPECTIVE_API_KEY not configured")
#     url = (
#         "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze"
#         f"?key={API_KEY}"
#     )

#     data = {
#         "comment": {"text": text},
#         "languages": languages or ["en"],
#         "requestedAttributes": attributes or {"TOXICITY": {}},
#     }
#     resp = requests.post(url, json=data)
#     logger.info("Perspective API status: %s", resp.status_code)
#     if resp.status_code != 200:
#         logger.error("Perspective API error: %s", resp.text)
#         return None
#     return resp.json()

import os
import requests

PERSPECTIVE_ATTRIBUTES = [
    "TOXICITY",
    "SEVERE_TOXICITY",
    "INSULT",
    "THREAT",
    "IDENTITY_ATTACK"
]

def moderate_text(text):
    api_key = os.getenv("PERSPECTIVE_API_KEY")
    url = f"https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key={api_key}"

    payload = {
        "comment": {"text": text},
        "requestedAttributes": {attr: {} for attr in PERSPECTIVE_ATTRIBUTES},
        "languages": ["en"]
    }

    response = requests.post(url, json=payload)
    if response.status_code != 200:
        return None

    result = response.json().get("attributeScores", {})
    scores = {
        attr: result[attr]["summaryScore"]["value"]
        for attr in result
    }

    # Calculate overall severity
    max_attr = max(scores, key=scores.get)
    score = scores[max_attr]
    severity = (
        "high" if score >= 0.85 else
        "medium" if score >= 0.65 else
        "low"
    )
    is_flagged = severity != "low"

    return {
        "score": score,
        "severity": severity,
        "is_flagged": is_flagged,
        "attributes": scores,
    }
