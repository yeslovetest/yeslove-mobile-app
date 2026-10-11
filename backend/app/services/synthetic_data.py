"""Synthetic data for local testing: lots of plausible content around one real test account.

Everything is made up. It creates people, posts, comments, reactions, friends, conversations,
notifications, events and professionals in the *local development database* so screens can be
tried with a realistic amount of content. It refuses to run against anything else.

* Synthetic people have usernames starting `synth_`, addresses at example.invalid and no Keycloak
  login, so nobody can sign in as them.
* Content written as the test account starts with `[sample]`, so it can be told apart and removed.
* `remove_synthetic_data()` deletes all of it again. It never touches anything else.
"""
import json
import random
import uuid
from datetime import datetime, timedelta
from urllib.parse import urlsplit

PREFIX = "synth_"
SAMPLE_MARK = "[sample] "
SYNTHETIC_ID_PREFIX = "synthetic:"

FIRST_NAMES = ["amara", "ben", "chloe", "dev", "elena", "farid", "grace", "hiro", "isla", "jonas", "kemi",
               "leo", "maya", "noor", "omar", "priya", "quinn", "rosa", "sam", "tara", "umar", "vera",
               "wes", "xia", "yusuf", "zara", "alba", "bruno", "cleo", "dana"]
BIOS = ["Here to listen and learn.", "New to this, taking it slowly.", "Tea, long walks and good books.",
        "Learning to talk about feelings.", "Parent, runner, work in progress.", "Quietly cheering everyone on.",
        "Trying to be kinder to myself.", "Here for the community."]
POSTS = [
    "Went for a long walk today and it genuinely helped clear my head.",
    "Small win: I told a friend how I was feeling instead of saying I was fine.",
    "Does anyone have tips for switching off from work in the evening?",
    "Three good things today: sunshine, a nice coffee, a phone call with my sister.",
    "Trying a no-phone hour before bed this week. Day two and it is harder than I expected.",
    "Reminder to myself and anyone reading: rest is not laziness.",
    "Has anyone tried journaling? I would love to hear what worked for you.",
    "Had a tough day but made dinner anyway. Counting that as a win.",
    "Learning that saying no politely is a skill you can practise.",
    "Grateful for this community. Thank you all for the kind words last week.",
    "Anyone else find mornings the hardest part of the day? What helps you?",
    "Started a short breathing exercise at lunchtime. Surprisingly calming.",
    "Looking for book recommendations about communication in relationships.",
    "Tried a new hobby today (pottery!) and was terrible at it. Loved it.",
    "Check in: how is everyone doing this week? No need to say you are fine.",
    "Spent the afternoon with no screens at all. Strange but good.",
    "Finding it easier to ask for help when I remember others have asked me.",
    "A quiet weekend and a long call with an old friend. Exactly what I needed.",
]
COMMENTS = ["Thanks for sharing this.", "I really relate to this.", "That sounds like a good step.",
            "Well done, that takes courage.", "I have been trying the same thing.", "Sending good wishes.",
            "Great idea, I might try that.", "Thank you, I needed to read this today.",
            "Take it one day at a time.", "Love this, keep going."]
MESSAGES = ["Hi, thanks for connecting.", "How has your week been?", "A bit busy but okay, you?",
            "Same here. I tried that walk you mentioned.", "Did it help?", "Yes, more than I thought it would.",
            "Glad to hear it. Shall we chat again next week?", "That would be lovely.",
            "I read the article you sent. Really useful.", "Happy to help. Let me know if you want more.",
            "Thinking of you today.", "Thank you, that means a lot.", "Do you fancy joining the event on Saturday?",
            "I might. What time does it start?", "Around two, I think. I will check and let you know.",
            "Perfect, thanks."]
EVENTS = [("Community coffee morning", "Church Street Cafe"), ("Mindful walk in the park", "Riverside Park"),
          ("Talking about feelings: open evening", "Community Hall"), ("Online support circle", "Online"),
          ("Book club: relationships and communication", "Central Library"),
          ("Gentle yoga and tea", "Willow Studio"), ("Creative writing for wellbeing", "Arts Centre"),
          ("Family and friends picnic", "Meadow Gardens")]
SPECIALISATIONS = ["Anxiety and stress", "Relationship counselling", "Bereavement support", "Family therapy",
                   "Work-related stress", "Building self-confidence"]
LICENCE_BODIES = ["HCPC", "BACP", "UKCP"]


class SyntheticDataRefused(Exception):
    pass


def check_safe_target(app):
    """Refuse unless this is a local development database."""
    import os

    uri = str(app.config.get("SQLALCHEMY_DATABASE_URI") or "")
    host = urlsplit(uri).hostname
    local = uri.startswith("sqlite") or host in ("localhost", "127.0.0.1", "::1")
    if os.getenv("FLASK_ENV") == "production" or not local:
        raise SyntheticDataRefused(
            f"Refusing: this is not a local development database (host: {host or 'unknown'}). "
            "Synthetic data is only for local testing."
        )


def _synthetic_user_ids():
    from app.models import User

    return [u.id for u in User.query.filter(User.username.like(PREFIX + "%")).with_entities(User.id)]


def remove_synthetic_data(app=None):
    """Delete everything seed_synthetic_data created. Returns counts."""
    from app import db
    from app.models import (
        Chat, Comment, ContentReport, Event, Follow, Like, Notification, Post, ProfessionalDetails, Reaction,
        User, UserBlock, WordPressProfessional, event_attendees,
    )

    counts = {}
    ids = _synthetic_user_ids()
    sample_posts = [p.id for p in Post.query.filter(Post.content.like(SAMPLE_MARK + "%")).with_entities(Post.id)]
    own_post_ids = [p.id for p in Post.query.filter(Post.user_id.in_(ids)).with_entities(Post.id)] if ids else []
    post_ids = list(set(sample_posts + own_post_ids))

    def run(label, query):
        counts[label] = query.delete(synchronize_session=False)

    if post_ids:
        run("reactions", Reaction.query.filter(Reaction.post_id.in_(post_ids)))
        run("likes", Like.query.filter(Like.post_id.in_(post_ids)))
        run("comments_on_posts", Comment.query.filter(Comment.post_id.in_(post_ids)))
    sample_comments = Comment.query.filter(Comment.content.like(SAMPLE_MARK + "%"))
    run("sample_comments", sample_comments)
    if ids:
        run("comments", Comment.query.filter(Comment.user_id.in_(ids)))
        run("reactions_by_synthetic", Reaction.query.filter(Reaction.user_id.in_(ids)))
        run("likes_by_synthetic", Like.query.filter(Like.user_id.in_(ids)))
        run("messages", Chat.query.filter(Chat.sender_id.in_(ids) | Chat.receiver_id.in_(ids)))
        run("follows", Follow.query.filter(Follow.follower_id.in_(ids) | Follow.followed_id.in_(ids)))
        run("blocks", UserBlock.query.filter(UserBlock.blocker_id.in_(ids) | UserBlock.blocked_id.in_(ids)))
        run("reports", ContentReport.query.filter(ContentReport.reporter_id.in_(ids) | ContentReport.reported_user_id.in_(ids)))
    if post_ids:
        run("posts", Post.query.filter(Post.id.in_(post_ids)))
    event_ids = [e.id for e in Event.query.filter(Event.name.like(SAMPLE_MARK + "%")).with_entities(Event.id)]
    if event_ids:
        db.session.execute(event_attendees.delete().where(event_attendees.c.event_id.in_(event_ids)))
        run("events", Event.query.filter(Event.id.in_(event_ids)))
    run("notifications", Notification.query.filter(Notification.data.like('%"synthetic": true%')))
    run("wordpress_professionals", WordPressProfessional.query.filter(WordPressProfessional.wp_user_id < 0))
    if ids:
        run("professional_details", ProfessionalDetails.query.filter(ProfessionalDetails.user_id.in_(ids)))
        run("people", User.query.filter(User.id.in_(ids)))
    db.session.commit()
    return counts


def seed_synthetic_data(target_username, *, people=24, professionals=6, seed=7, now=None, app=None):
    """Create synthetic content around the existing user `target_username`. Returns counts."""
    from app import db
    from app.models import (
        Chat, Comment, Event, Follow, Like, Notification, Post, ProfessionalDetails, Reaction, User, UserBlock,
        WordPressProfessional,
    )

    target = User.query.filter_by(username=target_username).first()
    if target is None:
        raise SyntheticDataRefused(f"No account named {target_username!r}. Sign up or sign in as it first.")
    if _synthetic_user_ids():
        raise SyntheticDataRefused("Synthetic data already exists. Remove it first (flask remove-synthetic-data).")

    rng = random.Random(seed)
    now = now or datetime.utcnow()
    counts = {}

    def ago(days=0.0, hours=0.0):
        return now - timedelta(days=days, hours=hours)

    # People
    members = []
    for i in range(people):
        name = FIRST_NAMES[i % len(FIRST_NAMES)] + ("" if i < len(FIRST_NAMES) else str(i))
        user = User(keycloak_id=f"{SYNTHETIC_ID_PREFIX}{uuid.uuid4()}", username=f"{PREFIX}{name}",
                    email=f"{PREFIX}{name}@example.invalid", bio=rng.choice(BIOS), user_type="standard",
                    created_at=ago(days=rng.randint(30, 400)))
        members.append(user)
    pros = []
    for i in range(professionals):
        name = f"pro_{FIRST_NAMES[(i * 5) % len(FIRST_NAMES)]}"
        user = User(keycloak_id=f"{SYNTHETIC_ID_PREFIX}{uuid.uuid4()}", username=f"{PREFIX}{name}",
                    email=f"{PREFIX}{name}@example.invalid", bio="Synthetic professional for testing.",
                    user_type="professional", created_at=ago(days=rng.randint(60, 500)))
        pros.append(user)
    db.session.add_all(members + pros)
    db.session.flush()
    for i, user in enumerate(pros):
        db.session.add(ProfessionalDetails(
            user_id=user.id, license_body=LICENCE_BODIES[i % 3], license_number=f"SYN-{1000 + i}",
            consent_license_data=True, specialization=SPECIALISATIONS[i % len(SPECIALISATIONS)],
            is_verified=True, verified_at=ago(days=rng.randint(5, 90))))
        # A local-only website row (negative id so the sync never deletes it), linked to the account.
        db.session.add(WordPressProfessional(
            wp_user_id=-(i + 1), name=user.username.replace(PREFIX, "").replace("pro_", "").title() + " (sample)",
            bio=f"Sample professional. {SPECIALISATIONS[i % len(SPECIALISATIONS)]}.", user_id=user.id))
    counts["people"], counts["professionals"] = len(members), len(pros)

    # Friends and followers
    friends = members[:max(6, people // 3)]
    for friend in friends:
        db.session.add(Follow(follower_id=target.id, followed_id=friend.id, follow_type="friend"))
    for follower in members[len(friends):len(friends) + max(4, people // 5)]:
        db.session.add(Follow(follower_id=follower.id, followed_id=target.id, follow_type="basic"))
    for a in friends[:6]:
        for b in rng.sample(members, 3):
            if a.id != b.id:
                exists = Follow.query.filter_by(follower_id=a.id, followed_id=b.id).first()
                if not exists:
                    db.session.add(Follow(follower_id=a.id, followed_id=b.id, follow_type="basic"))
    db.session.flush()
    counts["friends"] = len(friends)

    # Posts, comments, likes, reactions
    posts = []
    for i in range(48):
        author = rng.choice(members + [target] * 3)
        text = rng.choice(POSTS)
        posts.append(Post(content=(SAMPLE_MARK + text) if author is target else text, user_id=author.id,
                          timestamp=ago(days=rng.uniform(0, 60), hours=rng.uniform(0, 12)),
                          is_anonymous=(author is not target and rng.random() < 0.08)))
    db.session.add_all(posts)
    db.session.flush()
    comment_count = like_count = reaction_count = 0
    for post in posts:
        for _ in range(rng.choice([0, 0, 1, 2, 3, 5])):
            commenter = rng.choice(members + [target])
            text = rng.choice(COMMENTS)
            db.session.add(Comment(content=(SAMPLE_MARK + text) if commenter is target else text,
                                   user_id=commenter.id, post_id=post.id,
                                   timestamp=post.timestamp + timedelta(hours=rng.uniform(0.2, 40))))
            comment_count += 1
        for liker in rng.sample(members + [target], rng.choice([0, 1, 2, 4, 8])):
            db.session.add(Like(user_id=liker.id, post_id=post.id))
            like_count += 1
        for reactor in rng.sample(members, rng.choice([0, 0, 1, 3])):
            db.session.add(Reaction(user_id=reactor.id, post_id=post.id,
                                    reaction_type=rng.choice(["like", "love", "laugh", "support"])))
            reaction_count += 1
    counts.update(posts=len(posts), comments=comment_count, likes=like_count, reactions=reaction_count)

    # Conversations: with friends and with two professionals; the newest messages are unread.
    partners = friends[:8] + pros[:2]
    message_count = 0
    for partner in partners:
        length = rng.randint(8, 30)
        when = ago(days=rng.uniform(1, 25))
        for n in range(length):
            sender, receiver = (target, partner) if n % 2 == 0 else (partner, target)
            when += timedelta(minutes=rng.randint(3, 600))
            db.session.add(Chat(sender_id=sender.id, receiver_id=receiver.id,
                                message=MESSAGES[n % len(MESSAGES)], timestamp=when,
                                opened=not (sender is partner and n >= length - 2)))
            message_count += 1
    counts["messages"] = message_count
    counts["conversations"] = len(partners)

    # Notifications for the test account
    kinds = [("like", "Someone liked your post", "{} liked your post."),
             ("comment", "New comment", "{} commented on your post."),
             ("follow", "New follower", "{} started following you."),
             ("message", "New message", "{} sent you a message.")]
    for i in range(26):
        kind, title, body = rng.choice(kinds)
        who = rng.choice(members).username.replace(PREFIX, "")
        db.session.add(Notification(user_id=target.id, title=title, body=body.format(who), notification_type=kind,
                                    data={"synthetic": True}, is_read=rng.random() < 0.6,
                                    created_at=ago(days=rng.uniform(0, 20))))
    counts["notifications"] = 26

    # Events: some past, some coming up; the test account attends some
    for i, (name, place) in enumerate(EVENTS):
        offset = rng.choice([-30, -12, -3, 2, 5, 9, 16, 26]) + i * 0.1
        event = Event(name=SAMPLE_MARK + name, description="A friendly, made-up event for testing.",
                      location=place, event_time=now + timedelta(days=offset, hours=14),
                      creator_id=rng.choice(members).id)
        event.attendees = rng.sample(members, rng.randint(2, 9)) + ([target] if i % 2 == 0 else [])
        db.session.add(event)
    counts["events"] = len(EVENTS)

    # One blocked person, so blocking can be tried
    blocked = members[-1]
    db.session.add(UserBlock(blocker_id=target.id, blocked_id=blocked.id))
    counts["blocked"] = 1

    db.session.commit()
    return counts
