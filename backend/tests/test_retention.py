import unittest
from datetime import datetime, timedelta

from flask import Flask

from app import db
from app.services import retention_service
from app.services.retention_service import POLICY, REMOVED_TEXT, run_retention

NOW = datetime(2026, 10, 10, 12, 0, 0)


def days_ago(n):
    return NOW - timedelta(days=n)


class RetentionTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite://"
        self.app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
        import app.models  # noqa: F401  (registers every table before create_all)

        db.init_app(self.app)
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()
        from app.models import User

        self.user = User(keycloak_id="kc-1", username="u1", email="u1@example.test")
        db.session.add(self.user)
        db.session.commit()
        self.addCleanup(self._teardown)

    def _teardown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_old_device_tokens_are_deleted_and_recent_kept(self):
        from app.models import DeviceToken

        db.session.add_all([
            DeviceToken(user_id=self.user.id, token="old", last_used=days_ago(POLICY["device_tokens_unused"] + 1)),
            DeviceToken(user_id=self.user.id, token="new", last_used=days_ago(1)),
        ])
        db.session.commit()
        result = run_retention(now=NOW)
        self.assertEqual(result["device_tokens_unused"], 1)
        self.assertEqual([t.token for t in DeviceToken.query.all()], ["new"])

    def test_notifications_and_blog_views_expire(self):
        from app.models import Notification

        db.session.add_all([
            Notification(user_id=self.user.id, title="a", body="b", notification_type="posts", created_at=days_ago(400)),
            Notification(user_id=self.user.id, title="c", body="d", notification_type="posts", created_at=days_ago(5)),
        ])
        db.session.commit()
        self.assertEqual(run_retention(now=NOW)["notifications"], 1)
        self.assertEqual(Notification.query.count(), 1)

    def test_moderation_records_are_anonymised_not_deleted(self):
        from app.models import ModerationLog

        db.session.add_all([
            ModerationLog(user_id=self.user.id, content_type="post", content="secret words", severity="low",
                          auto_action="flagged", attributes={"a": 1}, timestamp=days_ago(400)),
            ModerationLog(user_id=self.user.id, content_type="post", content="recent words", severity="low",
                          auto_action="flagged", timestamp=days_ago(10)),
        ])
        db.session.commit()
        self.assertEqual(run_retention(now=NOW)["moderation_records"], 1)
        old, recent = ModerationLog.query.order_by(ModerationLog.id).all()
        self.assertIsNone(old.user_id)
        self.assertEqual(old.content, REMOVED_TEXT)
        self.assertIsNone(old.attributes)
        self.assertEqual(old.severity, "low")  # statistics survive
        self.assertEqual(recent.content, "recent words")
        self.assertEqual(recent.user_id, self.user.id)

    def test_moderation_rule_is_idempotent(self):
        from app.models import ModerationLog

        db.session.add(ModerationLog(user_id=None, content_type="post", content=REMOVED_TEXT, timestamp=days_ago(900)))
        db.session.commit()
        self.assertEqual(run_retention(now=NOW)["moderation_records"], 0)

    def test_only_closed_old_reports_are_deleted(self):
        from app.models import ContentReport

        old = days_ago(POLICY["closed_reports"] + 5)
        db.session.add_all([
            ContentReport(reporter_id=self.user.id, content_type="post", content_id=1, reason="spam", status="dismissed", created_at=old),
            ContentReport(reporter_id=self.user.id, content_type="post", content_id=2, reason="spam", status="open", created_at=old),
            ContentReport(reporter_id=self.user.id, content_type="post", content_id=3, reason="spam", status="actioned", created_at=days_ago(30)),
        ])
        db.session.commit()
        self.assertEqual(run_retention(now=NOW)["closed_reports"], 1)
        self.assertEqual(sorted(r.content_id for r in ContentReport.query.all()), [2, 3])

    def test_removed_posts_are_deleted_after_grace_and_files_cleaned(self):
        from app.models import Comment, Media, Post

        old_removed = Post(content="bad", user_id=self.user.id, status="removed", timestamp=days_ago(100))
        fresh_removed = Post(content="bad2", user_id=self.user.id, status="removed", timestamp=days_ago(10))
        visible = Post(content="fine", user_id=self.user.id, status="visible", timestamp=days_ago(500))
        db.session.add_all([old_removed, fresh_removed, visible])
        db.session.commit()
        db.session.add(Comment(content="c", user_id=self.user.id, post_id=old_removed.id))
        key_id = "0b9d5e1c-3f1a-4c52-8a9e-6f2d7c1b4a10"
        db.session.add(Media(content_type="image/png", filename="a.png", user_id=self.user.id, post_id=old_removed.id,
                             s3_url=f"https://x.test/media/{key_id}/a.png"))
        db.session.commit()

        deleted = []
        original = retention_service._delete_stored_file
        retention_service._delete_stored_file = deleted.append
        self.addCleanup(setattr, retention_service, "_delete_stored_file", original)

        self.assertEqual(run_retention(now=NOW)["removed_posts"], 1)
        self.assertEqual(sorted(p.content for p in Post.query.all()), ["bad2", "fine"])
        self.assertEqual(Comment.query.count(), 0)
        self.assertEqual(deleted, [f"https://x.test/media/{key_id}/a.png"])

    def test_dry_run_counts_but_changes_nothing(self):
        from app.models import Notification

        db.session.add(Notification(user_id=self.user.id, title="a", body="b", notification_type="posts", created_at=days_ago(400)))
        db.session.commit()
        self.assertEqual(run_retention(now=NOW, dry_run=True)["notifications"], 1)
        self.assertEqual(Notification.query.count(), 1)


if __name__ == "__main__":
    unittest.main()
