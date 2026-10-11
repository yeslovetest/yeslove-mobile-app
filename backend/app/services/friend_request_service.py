"""Friend requests: a person asks, the other person decides.

A request lives in its own table and only becomes friend rows in Follow once it is accepted, so a
pending request never gives access to messages or the friends feed.
"""
from datetime import datetime, timedelta

from app.logging_setup import setup_logger

logger = setup_logger()

MAX_REQUESTS_PER_DAY = 10
MAX_PENDING = 50
RETRY_AFTER_DECLINE_DAYS = 30


class FriendRequestError(Exception):
    def __init__(self, message, status):
        super().__init__(message)
        self.message, self.status = message, status


def ensure_friend_request_table(db):
    from app.models import FriendRequest

    FriendRequest.__table__.create(bind=db.engine, checkfirst=True)


def are_friends(user_id, other_id):
    from app.models import Follow

    rows = Follow.query.filter(
        Follow.follow_type == "friend",
        ((Follow.follower_id == user_id) & (Follow.followed_id == other_id))
        | ((Follow.follower_id == other_id) & (Follow.followed_id == user_id)),
    ).count()
    return rows == 2


def pending_between(requester_id, recipient_id):
    from app.models import FriendRequest

    return FriendRequest.query.filter_by(
        requester_id=requester_id, recipient_id=recipient_id, status="pending"
    ).first()


def incoming(user_id):
    from app.models import FriendRequest

    return FriendRequest.query.filter_by(recipient_id=user_id, status="pending").order_by(
        FriendRequest.created_at.desc()
    ).all()


def outgoing_pending_ids(user_id):
    from app.models import FriendRequest

    return {r.recipient_id for r in FriendRequest.query.filter_by(requester_id=user_id, status="pending")}


def send(user, target, now=None):
    """Create a pending request. Raises FriendRequestError when it must not be sent."""
    from app import db
    from app.models import FriendRequest

    now = now or datetime.utcnow()
    if user.id == target.id:
        raise FriendRequestError("You cannot add yourself as a friend", 400)
    if are_friends(user.id, target.id):
        raise FriendRequestError("You are already friends", 200)
    if pending_between(user.id, target.id):
        raise FriendRequestError("Friend request already sent", 200)

    declined = FriendRequest.query.filter(
        FriendRequest.requester_id == user.id,
        FriendRequest.recipient_id == target.id,
        FriendRequest.status == "declined",
        FriendRequest.responded_at > now - timedelta(days=RETRY_AFTER_DECLINE_DAYS),
    ).first()
    if declined:
        # Deliberately vague: it does not say the other person said no.
        raise FriendRequestError("You can't send a friend request to this person right now", 403)

    sent_today = FriendRequest.query.filter(
        FriendRequest.requester_id == user.id, FriendRequest.created_at > now - timedelta(days=1)
    ).count()
    pending = FriendRequest.query.filter_by(requester_id=user.id, status="pending").count()
    if sent_today >= MAX_REQUESTS_PER_DAY or pending >= MAX_PENDING:
        raise FriendRequestError("You have sent a lot of friend requests. Please try again later", 429)

    request_row = FriendRequest(requester_id=user.id, recipient_id=target.id, created_at=now)
    db.session.add(request_row)
    db.session.commit()
    return request_row


def accept(request_row, now=None):
    """Turn a pending request into the two friend rows (upgrading any plain follows)."""
    from app import db
    from app.models import Follow

    for follower, followed in ((request_row.requester_id, request_row.recipient_id),
                               (request_row.recipient_id, request_row.requester_id)):
        row = Follow.query.filter_by(follower_id=follower, followed_id=followed).first()
        if row:
            row.follow_type = "friend"
        else:
            db.session.add(Follow(follower_id=follower, followed_id=followed, follow_type="friend"))
    request_row.status = "accepted"
    request_row.responded_at = now or datetime.utcnow()
    db.session.commit()


def close(request_row, status, now=None):
    from app import db

    request_row.status = status
    request_row.responded_at = now or datetime.utcnow()
    db.session.commit()


def remove_between(user_id, other_id):
    """Drop every request between two people (used when one blocks the other)."""
    from app.models import FriendRequest

    FriendRequest.query.filter(
        ((FriendRequest.requester_id == user_id) & (FriendRequest.recipient_id == other_id))
        | ((FriendRequest.requester_id == other_id) & (FriendRequest.recipient_id == user_id))
    ).delete(synchronize_session=False)
