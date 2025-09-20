from app.perspective import analyze_text

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
