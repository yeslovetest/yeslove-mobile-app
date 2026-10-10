import io
from unittest import mock

import pytest


@pytest.fixture
def chat(app, monkeypatch):
    from app import db
    from app.models import User
    from app.utils import utils

    sender = User(keycloak_id="kc-sender", username="member", email="m@example.com")
    receiver = User(keycloak_id="kc-pro", username="drjane", email="j@example.com", user_type="professional")
    db.session.add_all([sender, receiver])
    db.session.commit()
    monkeypatch.setattr(utils, "verify_jwt", lambda token: {"sub": "kc-sender", "preferred_username": "member"})
    patches = [
        mock.patch("app.api.chat.chat_routes.handle_content_moderation",
                   return_value={"status": "ok", "allowed": True, "score": 0.0}),
        mock.patch("app.services.push_notification_service.PushNotificationService.send_to_user"),
        mock.patch("app.services.notification_service.NotificationService.create_notification"),
    ]
    for p in patches:
        p.start()
    yield sender, receiver
    mock.patch.stopall()


def send(client, **kwargs):
    return client.post("/api/chat/send_message", headers={"Authorization": "Bearer t"}, **kwargs)


def messages():
    from app.models import Chat

    return Chat.query.order_by(Chat.id).all()


def test_the_apps_multipart_message_is_accepted(client, chat):
    response = send(client, data={"receiver_id": "kc-pro", "message": "Hello"}, content_type="multipart/form-data")
    assert response.status_code == 201, response.get_json()
    [saved] = messages()
    assert (saved.message, saved.sender_id, saved.receiver_id) == ("Hello", chat[0].id, chat[1].id)


def test_a_json_message_still_works(client, chat):
    assert send(client, json={"receiver_id": "kc-pro", "message": "Hi"}).status_code == 201
    assert [m.message for m in messages()] == ["Hi"]


def test_attached_files_are_stored_privately_and_linked(client, chat):
    stored = mock.Mock(side_effect=[{"media_id": 11}, {"media_id": 12}])
    with mock.patch("app.services.media.media_service.MediaService.store_file", stored):
        response = send(client, content_type="multipart/form-data", data={
            "receiver_id": "kc-pro", "message": "photos",
            "media": [(io.BytesIO(b"a"), "a.png"), (io.BytesIO(b"b"), "b.png")],
        })
    assert response.status_code == 201, response.get_json()
    assert [str(m.media_id) for m in messages()] == ["11", "12"]
    assert all(call.kwargs["is_public"] is False for call in stored.call_args_list)


def test_a_message_with_only_a_file_is_accepted(client, chat):
    with mock.patch("app.services.media.media_service.MediaService.store_file", return_value={"media_id": 5}):
        response = send(client, content_type="multipart/form-data",
                        data={"receiver_id": "kc-pro", "media": [(io.BytesIO(b"a"), "a.png")]})
    assert response.status_code == 201, response.get_json()


def test_an_upload_failure_saves_nothing(client, chat):
    with mock.patch("app.services.media.media_service.MediaService.store_file", side_effect=RuntimeError("boom")):
        response = send(client, content_type="multipart/form-data",
                        data={"receiver_id": "kc-pro", "message": "x", "media": [(io.BytesIO(b"a"), "a.png")]})
    assert response.status_code == 500 and messages() == []


@pytest.mark.parametrize("data", [{"receiver_id": "kc-pro"}, {"message": "no receiver"}])
def test_missing_pieces_are_refused(client, chat, data):
    assert send(client, data=data, content_type="multipart/form-data").status_code == 400
    assert messages() == []


def test_unknown_receiver_and_self_are_refused(client, chat):
    assert send(client, data={"receiver_id": "nobody", "message": "x"}, content_type="multipart/form-data").status_code == 404
    assert send(client, data={"receiver_id": "kc-sender", "message": "x"}, content_type="multipart/form-data").status_code == 400


def test_a_blocked_pair_cannot_message(client, chat):
    from app import db
    from app.models import UserBlock

    db.session.add(UserBlock(blocker_id=chat[1].id, blocked_id=chat[0].id))
    db.session.commit()
    response = send(client, data={"receiver_id": "kc-pro", "message": "x"}, content_type="multipart/form-data")
    assert response.status_code == 403 and messages() == []


def friends_for(client, keycloak_id, monkeypatch):
    from app.utils import utils

    monkeypatch.setattr(utils, "verify_jwt", lambda token: {"sub": keycloak_id, "preferred_username": "x"})
    response = client.get(f"/api/chat/friends/{keycloak_id}", headers={"Authorization": "Bearer t"})
    assert response.status_code == 200, response.get_json()
    return response.get_json()["friends"]


def test_both_people_see_a_conversation_even_if_they_are_not_friends(client, chat, monkeypatch):
    send(client, data={"receiver_id": "kc-pro", "message": "Hello doctor"}, content_type="multipart/form-data")
    pro_list = friends_for(client, "kc-pro", monkeypatch)
    assert [f["id"] for f in pro_list] == ["kc-sender"]
    assert pro_list[0]["last_message"] == "Hello doctor" and pro_list[0]["unread"] is True
    member_list = friends_for(client, "kc-sender", monkeypatch)
    assert [f["id"] for f in member_list] == ["kc-pro"]


def test_strangers_without_messages_are_not_listed(client, chat, monkeypatch):
    assert friends_for(client, "kc-pro", monkeypatch) == []


def test_a_blocked_person_is_hidden_from_the_list(client, chat, monkeypatch):
    from app import db
    from app.models import UserBlock

    send(client, data={"receiver_id": "kc-pro", "message": "Hello"}, content_type="multipart/form-data")
    db.session.add(UserBlock(blocker_id=chat[1].id, blocked_id=chat[0].id))
    db.session.commit()
    assert friends_for(client, "kc-pro", monkeypatch) == []
