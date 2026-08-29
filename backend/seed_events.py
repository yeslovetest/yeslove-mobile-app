"""Seed a few sample events for testing. Safe to re-run (skips duplicates)."""
from datetime import datetime, timedelta
from app import create_app, db
from app.config import ProductionConfig
from app.models import Event, User

# IMPORTANT: use ProductionConfig so we hit the real Postgres DB, not SQLite dev.
app = create_app(ProductionConfig)

SAMPLE_EVENTS = [
    {"name": "Healthy Relationships Workshop",
     "description": "An interactive workshop on building trust, communication, and emotional resilience in relationships.",
     "location": "London Community Centre", "days_from_now": 7},
    {"name": "Mental Health & Love Support Circle",
     "description": "A safe, welcoming space to share experiences and learn coping strategies together.",
     "location": "Manchester Wellbeing Hub", "days_from_now": 14},
    {"name": "Couples Communication Evening",
     "description": "Practical tools and guided exercises to help couples connect more deeply.",
     "location": "Birmingham Family Centre", "days_from_now": 21},
    {"name": "Understanding Attachment Styles",
     "description": "A talk exploring how attachment styles shape our relationships, with Q&A.",
     "location": "Online (Zoom)", "days_from_now": 30},
]

with app.app_context():
    creator = User.query.first()
    if not creator:
        print("No users found - cannot seed events.")
    else:
        created = 0
        for e in SAMPLE_EVENTS:
            if Event.query.filter_by(name=e["name"]).first():
                print(f"Skipping (already exists): {e['name']}")
                continue
            db.session.add(Event(
                name=e["name"],
                description=e["description"],
                location=e["location"],
                event_time=datetime.utcnow() + timedelta(days=e["days_from_now"]),
                creator_id=creator.id,
            ))
            created += 1
            print(f"Added: {e['name']}")
        db.session.commit()
        print(f"\nDone. {created} new events seeded (creator: {creator.username}).")
