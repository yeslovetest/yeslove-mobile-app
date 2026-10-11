from datetime import datetime, timedelta
from unittest import mock

import pytest

from app.services import friend_request_service as friends


@pytest.fixture
def people(app, monkeypatch):
    from app import db
    from app.models import User
    from app.utils import utils

    me = User(keycloak_id="kc-me", username="me", email="me@example.com")
    ann = User(keycloak_id="kc-ann", username="ann", email="ann@example.com")
    bob = User(keycloak_id="kc-bob", username="bob", email="bob@example.com")
    db.session.add_all([me, ann, bob])
    db.session.commit()
    who = {"sub": "kc-me"}
    monkeypatch.setattr(utils, "verify_jwt", lambda token: {"sub": who["sub"], "preferred_username": who["sub"]})
    notify = mock.patch("app.services.notification_service.NotificationService.create_notification")
    notified = notify.start()
    mock.patch("app.services.push_notification_service.PushNotificationService.send_to_user").start()
    yield type("P", (), {"me": me, "ann": ann, "bob": bob, "as_": staticmethod(lambda kc: who.update(sub=kc)),
                         "notified": notified})
    mock.patch.stopall()


def call(client, kc, target, **body):
    return client.post(f"/api/feed/follow/{target}", json=body, headers={"Authorization": "Bearer t"})


def ask(client, p, target="kc-ann", frm="kc-me"):
    p.as_(frm)
    return call(client, frm, target, action="follow", follow_type="friend")


def friend_rows():
    from app.models import Follow

    return Follow.query.filter_by(follow_type="friend").count()


def test_asking_creates_a_pending_request_and_no_friendship(client, people):
    response = ask(client, people)
    assert response.status_code == 202
    from app.models import FriendRequest

    [row] = FriendRequest.query.all()
    assert (row.requester_id, row.recipient_id, row.status) == (people.me.id, people.ann.id, "pending")
    assert friend_rows() == 0
    assert people.notified.call_args.kwargs["user_id"] == people.ann.id


def test_the_recipient_sees_the_request_and_the_sender_does_not(client, people):
    ask(client, people)
    people.as_("kc-ann")
    seen = client.get("/api/feed/friend-requests", headers={"Authorization": "Bearer t"}).get_json()
    assert [r["username"] for r in seen["requests"]] == ["me"] and seen["requests"][0]["keycloak_id"] == "kc-me"
    people.as_("kc-me")
    assert client.get("/api/feed/friend-requests", headers={"Authorization": "Bearer t"}).get_json()["requests"] == []


def test_a_pending_request_gives_no_access_to_chat_friends(client, people):
    ask(client, people)
    for kc, user in (("kc-me", people.me), ("kc-ann", people.ann)):
        people.as_(kc)
        reply = client.get(f"/api/chat/friends/{kc}", headers={"Authorization": "Bearer t"})
        assert reply.status_code == 200
        assert reply.get_json()["friends"] == []


def test_accepting_makes_both_people_friends_and_tells_the_requester(client, people):
    ask(client, people)
    response = ask(client, people, target="kc-me", frm="kc-ann")
    assert response.status_code == 201
    assert friend_rows() == 2 and friends.are_friends(people.me.id, people.ann.id)
    from app.models import FriendRequest

    assert FriendRequest.query.one().status == "accepted"
    assert people.notified.call_args.kwargs["user_id"] == people.me.id


def test_accepting_upgrades_an_existing_plain_follow(client, people):
    people.as_("kc-me")
    assert call(client, "kc-me", "kc-ann", action="follow", follow_type="basic").status_code == 201
    ask(client, people)
    ask(client, people, target="kc-me", frm="kc-ann")
    from app.models import Follow

    assert Follow.query.count() == 2 and friend_rows() == 2


def test_declining_creates_no_friendship_and_tells_nobody(client, people):
    ask(client, people)
    people.notified.reset_mock()
    people.as_("kc-ann")
    assert call(client, "kc-ann", "kc-me", action="decline", follow_type="friend").status_code == 200
    from app.models import FriendRequest

    assert FriendRequest.query.one().status == "declined"
    assert friend_rows() == 0 and not people.notified.called


def test_declining_when_nothing_is_pending_does_not_create_a_friendship(client, people):
    people.as_("kc-ann")
    assert call(client, "kc-ann", "kc-me", action="decline", follow_type="friend").status_code == 404
    assert friend_rows() == 0


def test_a_declined_person_cannot_ask_again_for_30_days(client, people):
    ask(client, people)
    people.as_("kc-ann")
    call(client, "kc-ann", "kc-me", action="decline", follow_type="friend")
    again = ask(client, people)
    assert again.status_code == 403 and "declined" not in again.get_json()["message"].lower()
    from app import db
    from app.models import FriendRequest

    FriendRequest.query.one().responded_at = datetime.utcnow() - timedelta(days=31)
    db.session.commit()
    assert ask(client, people).status_code == 202


def test_the_sender_can_withdraw_a_request(client, people):
    ask(client, people)
    assert call(client, "kc-me", "kc-ann", action="unfollow", follow_type="friend").status_code == 200
    from app.models import FriendRequest

    assert FriendRequest.query.one().status == "cancelled"
    assert ask(client, people).status_code == 202


def test_asking_twice_does_not_create_two_requests(client, people):
    ask(client, people)
    assert ask(client, people).status_code == 200
    from app.models import FriendRequest

    assert FriendRequest.query.count() == 1


def test_asking_someone_who_is_already_a_friend_changes_nothing(client, people):
    ask(client, people)
    ask(client, people, target="kc-me", frm="kc-ann")
    assert ask(client, people).status_code == 200
    assert friend_rows() == 2


def test_unfollowing_a_friend_removes_both_friend_rows(client, people):
    ask(client, people)
    ask(client, people, target="kc-me", frm="kc-ann")
    assert call(client, "kc-ann", "kc-me", action="unfollow", follow_type="friend").status_code == 200
    assert friend_rows() == 0


def test_blocking_removes_pending_requests_and_stops_new_ones(client, people):
    ask(client, people)
    people.as_("kc-ann")
    assert client.post("/api/safety/block/kc-me", headers={"Authorization": "Bearer t"}).status_code == 201
    from app.models import FriendRequest

    assert FriendRequest.query.count() == 0
    assert ask(client, people).status_code == 404


def test_requests_from_someone_you_blocked_are_not_listed(client, people):
    from app import db
    from app.models import FriendRequest, UserBlock

    db.session.add(FriendRequest(requester_id=people.me.id, recipient_id=people.ann.id))
    db.session.add(UserBlock(blocker_id=people.ann.id, blocked_id=people.me.id))
    db.session.commit()
    people.as_("kc-ann")
    assert client.get("/api/feed/friend-requests", headers={"Authorization": "Bearer t"}).get_json()["requests"] == []


def test_there_is_a_daily_limit_and_a_pending_limit(app, people):
    from app import db
    from app.models import User

    others = [User(keycloak_id=f"kc-x{i}", username=f"x{i}", email=f"x{i}@example.com") for i in range(12)]
    db.session.add_all(others)
    db.session.commit()
    for other in others[:10]:
        friends.send(people.me, other)
    with pytest.raises(friends.FriendRequestError) as stopped:
        friends.send(people.me, others[10])
    assert stopped.value.status == 429
    later = datetime.utcnow() + timedelta(days=2)
    friends.send(people.me, others[10], now=later)  # a new day, under the pending cap
    friends.MAX_PENDING = 11
    try:
        with pytest.raises(friends.FriendRequestError):
            friends.send(people.me, others[11], now=later)
    finally:
        friends.MAX_PENDING = 50


def test_the_following_list_shows_requested_and_friend(client, people):
    ask(client, people)
    people.as_("kc-me")
    seen = client.get("/api/feed/following/kc-me", headers={"Authorization": "Bearer t"}).get_json()["following"]
    assert [(f["id"], f["follow_type"], f["friendship_status"]) for f in seen] == [("kc-ann", "friend", "requested")]
    ask(client, people, target="kc-me", frm="kc-ann")
    people.as_("kc-me")
    seen = client.get("/api/feed/following/kc-me", headers={"Authorization": "Bearer t"}).get_json()["following"]
    assert [(f["id"], f["friendship_status"]) for f in seen] == [("kc-ann", "friend")]


def test_a_plain_follow_still_works_and_cannot_be_repeated(client, people):
    people.as_("kc-me")
    assert call(client, "kc-me", "kc-bob", action="follow", follow_type="basic").status_code == 201
    assert call(client, "kc-me", "kc-bob", action="follow", follow_type="basic").status_code == 400
    assert call(client, "kc-me", "kc-bob", action="unfollow").status_code == 200


def test_unknown_actions_are_refused_and_you_cannot_follow_yourself(client, people):
    people.as_("kc-me")
    assert call(client, "kc-me", "kc-ann", action="explode").status_code == 400
    assert call(client, "kc-me", "kc-me", action="follow").status_code == 400


def test_existing_friendships_are_left_alone(client, people):
    from app import db
    from app.models import Follow

    db.session.add_all([Follow(follower_id=people.me.id, followed_id=people.ann.id, follow_type="friend"),
                        Follow(follower_id=people.ann.id, followed_id=people.me.id, follow_type="friend")])
    db.session.commit()
    people.as_("kc-me")
    seen = client.get("/api/feed/following/kc-me", headers={"Authorization": "Bearer t"}).get_json()["following"]
    assert [(f["id"], f["friendship_status"]) for f in seen] == [("kc-ann", "friend")]


def test_erasing_an_account_removes_its_requests_and_the_export_lists_them(app, people):
    from app import db
    from app.models import FriendRequest
    from app.services.account_service import AccountService

    db.session.add(FriendRequest(requester_id=people.me.id, recipient_id=people.ann.id))
    db.session.commit()
    exported = AccountService.export_user_data(people.ann)
    assert exported["friend_requests"][0]["with"] == "me" and exported["friend_requests"][0]["direction"] == "received"
    AccountService.erase_user_data(people.ann)
    assert FriendRequest.query.count() == 0


def test_retention_purges_old_answered_requests_but_not_pending_or_recent_ones(app, people):
    from app import db
    from app.models import FriendRequest
    from app.services.retention_service import run_retention

    old = datetime.utcnow() - timedelta(days=100)
    db.session.add_all([
        FriendRequest(requester_id=people.me.id, recipient_id=people.ann.id, status="declined", responded_at=old),
        FriendRequest(requester_id=people.me.id, recipient_id=people.bob.id, status="pending"),
        FriendRequest(requester_id=people.ann.id, recipient_id=people.bob.id, status="accepted",
                      responded_at=datetime.utcnow() - timedelta(days=5)),
    ])
    db.session.commit()
    assert run_retention()["friend_requests_answered"] == 1
    assert sorted(r.status for r in FriendRequest.query.all()) == ["accepted", "pending"]
