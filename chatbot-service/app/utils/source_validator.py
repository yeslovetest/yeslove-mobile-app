"""Source validation utilities for RAG chatbot"""
import fnmatch
from urllib.parse import urlparse
from config.sources import ALLOWED_SOURCES, BLOCKED_PATTERNS, SOURCE_CATEGORIES

def is_url_allowed(url: str) -> tuple[bool, str, str]:
    """Check if URL is allowed and return category info"""
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    path = parsed.path
    
    # Check blocked patterns first
    for pattern in BLOCKED_PATTERNS:
        if pattern in path:
            return False, "", ""
    
    # Check allowed sources
    for allowed_domain, config in ALLOWED_SOURCES.items():
        if domain == allowed_domain or domain.endswith(f".{allowed_domain}"):
            for pattern in config["patterns"]:
                if fnmatch.fnmatch(path, pattern):
                    return True, config["category"], config["name"]
    
    return False, "", ""

def get_source_priority(category: str) -> int:
    """Get priority for source category"""
    return SOURCE_CATEGORIES.get(category, {}).get("priority", 999)

def get_source_weight(category: str) -> float:
    """Get weight for source category"""
    return SOURCE_CATEGORIES.get(category, {}).get("weight", 0.1)