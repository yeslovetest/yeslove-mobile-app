"""RAG chatbot source configuration for YesLove"""

# Source categories and priorities
SOURCE_CATEGORIES = {
    "yeslove.blogs": {"priority": 1, "weight": 1.0},
    "relationships.core": {"priority": 2, "weight": 0.9},
    "relationships.abuse-support": {"priority": 2, "weight": 0.9},
    "youth.rse": {"priority": 3, "weight": 0.8},
    "context.mental-health": {"priority": 4, "weight": 0.7},
    "context.cultural": {"priority": 4, "weight": 0.7},
    "relationships.contextual": {"priority": 5, "weight": 0.5}
}

# Allowed external sources with URL patterns and categories
ALLOWED_SOURCES = {
    # Core relationship & wellbeing sources (main priority)
    "relate.org.uk": {
        "patterns": ["/get-help/*"],
        "category": "relationships.core",
        "name": "Relate"
    },
    "brook.org.uk": {
        "patterns": ["/your-life/relationships/*", "/your-life/sex/consent/*"],
        "category": "relationships.core", 
        "name": "Brook"
    },
    "mind.org.uk": {
        "patterns": ["/information-support/*relationships-and-feelings/*"],
        "category": "relationships.core",
        "name": "Mind"
    },
    "womensaid.org.uk": {
        "patterns": ["/information-support/*"],
        "category": "relationships.abuse-support",
        "name": "Women's Aid"
    },
    "refuge.org.uk": {
        "patterns": ["/i-need-help-now/*"],
        "category": "relationships.abuse-support",
        "name": "Refuge"
    },
    "mensadviceline.org.uk": {
        "patterns": ["/*"],
        "category": "relationships.abuse-support",
        "name": "Men's Advice Line"
    },
    "galop.org.uk": {
        "patterns": ["/helpline/*", "/resources/*", "/support-services/*"],
        "category": "relationships.abuse-support",
        "name": "Galop"
    },
    "youngminds.org.uk": {
        "patterns": ["/young-person/relationships/*"],
        "category": "youth.rse",
        "name": "YoungMinds"
    },
    "childline.org.uk": {
        "patterns": ["/info-advice/your-feelings/relationships-friends-and-family/*"],
        "category": "youth.rse",
        "name": "Childline"
    },
    "nspcc.org.uk": {
        "patterns": ["/advice-for-families/relationships/*"],
        "category": "youth.rse",
        "name": "NSPCC"
    },
    
    # Context / emotional wellbeing sources (secondary)
    "nhs.uk": {
        "patterns": ["/mental-health/*"],
        "category": "context.mental-health",
        "name": "NHS"
    },
    "nice.org.uk": {
        "patterns": ["/guidance/*"],
        "category": "context.mental-health",
        "name": "NICE"
    },
    "baatn.org.uk": {
        "patterns": ["/resources/*"],
        "category": "context.cultural",
        "name": "BAATN"
    },
    "blackmindsmatteruk.com": {
        "patterns": ["/resources/*"],
        "category": "context.cultural",
        "name": "Black Minds Matter UK"
    },
    "mwnuk.co.uk": {
        "patterns": ["/resources.php*"],
        "category": "context.cultural",
        "name": "Muslim Women's Network UK"
    },
    "southallblacksisters.org.uk": {
        "patterns": ["/resources/*"],
        "category": "context.cultural",
        "name": "Southall Black Sisters"
    },
    
    # Psychology Today (filtered use only)
    "psychologytoday.com": {
        "patterns": [
            "/intl/blog/*relationship*",
            "/intl/topics/relationships",
            "/intl/topics/love", 
            "/intl/topics/attachment"
        ],
        "category": "relationships.contextual",
        "name": "Psychology Today"
    }
}

# Blocked URL patterns
BLOCKED_PATTERNS = [
    "/news/", "/policy/", "/press/", "/campaigns/", 
    "/donate/", "/jobs/", "/events/", "/shop/", "/about-us/",
    "/find-a-therapist/", "/advertising/", "/forums/"
]

# Crisis keywords that trigger abuse support sources first
CRISIS_KEYWORDS = [
    "abuse", "violence", "harm", "threat", "danger", "crisis",
    "suicide", "self-harm", "emergency", "helpline", "domestic"
]