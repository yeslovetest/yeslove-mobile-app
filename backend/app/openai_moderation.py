"""OpenAI moderation client (omni-moderation), the replacement for Perspective API.

Google ends Perspective API on 31 Dec 2026. OpenAI's moderation endpoint is free
to use with an existing API key and returns per-category probabilities.
"""
import os

import requests

from app.logging_setup import setup_logger

logger = setup_logger()

MODERATION_URL = "https://api.openai.com/v1/moderations"
MODERATION_MODEL = os.getenv("OPENAI_MODERATION_MODEL", "omni-moderation-latest")
TIMEOUT_SECONDS = 8


def analyze_text(text: str):
    """Return OpenAI's first moderation result dict, or None if unavailable."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    try:
        resp = requests.post(
            MODERATION_URL,
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": MODERATION_MODEL, "input": text},
            timeout=TIMEOUT_SECONDS,
        )
    except requests.RequestException as exc:
        logger.warning("OpenAI moderation request failed: %s", exc)
        return None
    if resp.status_code != 200:
        logger.warning("OpenAI moderation returned %s", resp.status_code)
        return None
    try:
        return resp.json()["results"][0]
    except (KeyError, IndexError, ValueError):
        logger.warning("OpenAI moderation returned an unexpected response")
        return None


def normalise(result: dict) -> dict:
    """Map OpenAI category scores onto YesLove's moderation labels (0 to 1)."""
    s = result.get("category_scores") or {}

    def top(*names):
        return max((float(s.get(n, 0.0) or 0.0) for n in names), default=0.0)

    return {
        "HARASSMENT": top("harassment", "hate"),
        "THREAT": top("harassment/threatening", "hate/threatening", "violence"),
        "SEXUAL": top("sexual"),
        "SEXUAL_MINORS": top("sexual/minors"),
        "SELF_HARM": top("self-harm", "self-harm/intent", "self-harm/instructions"),
    }
