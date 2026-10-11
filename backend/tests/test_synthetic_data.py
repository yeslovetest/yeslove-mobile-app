import pytest

from app.services import synthetic_data as sd


@pytest.fixture
def me(app):
    from app import db
    from app.models import Post, User

    user = User(keycloak_id="kc-me", username="test-user", email="t@example.com")
    other = User(keycloak_id="kc-real", username="realperson", email="r@example.com")
    db.session.add_all([user, other])
    db.session.flush()
    db.session.add(Post(content="A real post that must survive", user_id=other.id))
    db.session.commit()
    return user


def test_it_refuses_a_database_that_is_not_local(app):
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://admin:pw@main-db/yeslove"
    with pytest.raises(sd.SyntheticDataRefused, match="not a local development database"):
        sd.check_safe_target(app)


def test_it_refuses_in_production_even_with_a_local_looking_database(app, monkeypatch):
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://admin:pw@localhost/yeslove"
    monkeypatch.setenv("FLASK_ENV", "production")
    with pytest.raises(sd.SyntheticDataRefused):
        sd.check_safe_target(app)


def test_local_databases_are_accepted(app, monkeypatch):
    monkeypatch.setenv("FLASK_ENV", "development")
    for uri in ("sqlite:///dev.db", "sqlite://", "postgresql://u:p@localhost/db", "postgresql://u:p@127.0.0.1/db"):
        app.config["SQLALCHEMY_DATABASE_URI"] = uri
        sd.check_safe_target(app)


def test_it_needs_an_existing_account(app):
    with pytest.raises(sd.SyntheticDataRefused, match="No account named"):
        sd.seed_synthetic_data("nobody")


def test_seeding_creates_content_in_every_area_around_the_account(me):
    from app.models import Chat, Comment, Event, Follow, Notification, Post, User, WordPressProfessional

    counts = sd.seed_synthetic_data("test-user", people=24)
    assert counts["people"] == 24 and counts["professionals"] == 6
    assert counts["posts"] >= 40 and counts["comments"] > 20 and counts["messages"] > 100
    assert Chat.query.filter((Chat.sender_id == me.id) | (Chat.receiver_id == me.id)).count() == counts["messages"]
    assert Notification.query.filter_by(user_id=me.id).count() == counts["notifications"]
    assert Follow.query.filter_by(follower_id=me.id, follow_type="friend").count() == counts["friends"]
    assert Event.query.count() == counts["events"] and any(me in e.attendees for e in Event.query.all())
    assert WordPressProfessional.query.filter(WordPressProfessional.user_id.isnot(None)).count() == 6


def test_synthetic_people_cannot_sign_in_and_use_no_real_addresses(me):
    from app.models import User

    sd.seed_synthetic_data("test-user")
    fakes = User.query.filter(User.username.like("synth_%")).all()
    assert fakes and all(u.email.endswith("@example.invalid") for u in fakes)
    assert all(u.keycloak_id.startswith("synthetic:") for u in fakes)


def test_content_written_as_the_account_is_marked_as_sample(me):
    from app.models import Comment, Post

    sd.seed_synthetic_data("test-user")
    mine = Post.query.filter_by(user_id=me.id).all()
    assert mine and all(p.content.startswith("[sample] ") for p in mine)
    assert all(c.content.startswith("[sample] ") for c in Comment.query.filter_by(user_id=me.id))


def test_seeding_twice_is_refused_until_it_is_removed(me):
    sd.seed_synthetic_data("test-user")
    with pytest.raises(sd.SyntheticDataRefused, match="already exists"):
        sd.seed_synthetic_data("test-user")


def test_removal_deletes_everything_synthetic_and_nothing_else(me):
    from app.models import (Chat, Comment, Event, Follow, Like, Notification, Post, ProfessionalDetails, Reaction,
                            User, UserBlock, WordPressProfessional)

    sd.seed_synthetic_data("test-user")
    sd.remove_synthetic_data()
    assert User.query.filter(User.username.like("synth_%")).count() == 0
    for model in (Chat, Comment, Event, Follow, Like, Notification, Reaction, UserBlock, ProfessionalDetails,
                  WordPressProfessional):
        assert model.query.count() == 0, model.__name__
    assert [p.content for p in Post.query.all()] == ["A real post that must survive"]
    assert {u.username for u in User.query.all()} == {"test-user", "realperson"}


def test_seeding_is_repeatable_after_removal(me):
    first = sd.seed_synthetic_data("test-user", seed=3)
    sd.remove_synthetic_data()
    assert sd.seed_synthetic_data("test-user", seed=3) == first


def test_the_conversations_show_up_in_the_messages_list(client, me, monkeypatch):
    from app.utils import utils

    counts = sd.seed_synthetic_data("test-user")
    monkeypatch.setattr(utils, "verify_jwt", lambda token: {"sub": "kc-me", "preferred_username": "test-user"})
    body = client.get("/api/chat/friends/kc-me", headers={"Authorization": "Bearer t"}).get_json()
    assert len(body["friends"]) >= counts["conversations"]
    assert any(f["unread"] for f in body["friends"])


def test_synthetic_professionals_can_be_messaged_from_the_directory(client, me, monkeypatch):
    from app.services.wordpress_professional_service import list_cached_professionals

    sd.seed_synthetic_data("test-user")
    listed = list_cached_professionals(1, 50)["professionals"]
    assert len(listed) == 6 and all(p["keycloak_id"].startswith("synthetic:") for p in listed)


def test_the_website_sync_leaves_local_only_rows_alone(me):
    from app.models import WordPressProfessional
    from unittest import mock
    from app.services import wordpress_professional_service as service

    sd.seed_synthetic_data("test-user")
    page = {"professionals": [{"id": 5, "source": "wordpress", "keycloak_id": None, "username": "Real Pro", "bio": "",
                               "profile_pic": None, "specialization": None, "license_body": None}],
            "pagination": {"page": 1, "per_page": 100, "total_professionals": 1, "total_pages": 1,
                           "has_next": False, "has_prev": False}}
    with mock.patch.object(service, "fetch_professionals", return_value=page):
        service.sync_professionals()
    assert WordPressProfessional.query.filter(WordPressProfessional.wp_user_id < 0).count() == 6
    assert WordPressProfessional.query.filter_by(wp_user_id=5).count() == 1


def test_the_commands_work_and_refuse_a_non_local_database(app, me):
    runner = app.test_cli_runner()
    ok = runner.invoke(args=["seed-synthetic-data", "--user", "test-user"])
    assert ok.exit_code == 0 and "Created:" in ok.output
    again = runner.invoke(args=["seed-synthetic-data", "--user", "test-user"])
    assert again.exit_code != 0 and "already exists" in again.output
    assert runner.invoke(args=["seed-synthetic-data", "--user", "test-user", "--reset"]).exit_code == 0
    assert runner.invoke(args=["remove-synthetic-data"]).exit_code == 0
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://admin:pw@main-db/yeslove"
    refused = runner.invoke(args=["seed-synthetic-data", "--user", "test-user"])
    assert refused.exit_code != 0 and "not a local" in refused.output


def test_message_notifications_name_someone_the_account_has_a_conversation_with(me):
    from app.models import Chat, Notification, User

    sd.seed_synthetic_data("test-user")
    talked_to = {
        User.query.get(c.sender_id if c.receiver_id == me.id else c.receiver_id).username
        for c in Chat.query.filter((Chat.sender_id == me.id) | (Chat.receiver_id == me.id))
    }
    messages = Notification.query.filter_by(user_id=me.id, notification_type="message").all()
    assert messages
    for n in messages:
        assert n.body.split(" ")[0] in talked_to


def test_an_empty_bio_gets_a_sample_one_that_removal_takes_back(me):
    from app.models import User

    sd.seed_synthetic_data("test-user")
    assert User.query.get(me.id).bio == sd.SAMPLE_BIO
    sd.remove_synthetic_data()
    assert User.query.get(me.id).bio == ""


def test_a_real_bio_is_never_overwritten(me):
    from app import db
    from app.models import User

    me.bio = "My own words"
    db.session.commit()
    sd.seed_synthetic_data("test-user")
    sd.remove_synthetic_data()
    assert User.query.get(me.id).bio == "My own words"
