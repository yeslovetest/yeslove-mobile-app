# backend/app/perspective.py
import os
import requests
from app.logging_setup import setup_logger

logger = setup_logger()

API_KEY = os.getenv("PERSPECTIVE_API_KEY")

def analyze_text(text, *, languages=None, attributes=None):
    """Send text to Perspective API and return the response JSON."""
    if not API_KEY:
        raise RuntimeError("PERSPECTIVE_API_KEY not configured")
    url = (
        "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze"
        f"?key={API_KEY}"
    )

    data = {
        "comment": {"text": text},
        "languages": languages or ["en"],
        "requestedAttributes": attributes or {"TOXICITY": {}},
    }
    resp = requests.post(url, json=data)
    logger.info("Perspective API status: %s", resp.status_code)
    if resp.status_code != 200:
        logger.error("Perspective API error: %s", resp.text)
        return None
    return resp.json()
