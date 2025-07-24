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
