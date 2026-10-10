import unittest
from unittest import mock

from flask import Flask
from flask_restx import Api

from app import db


class MediaAccessTests(unittest.TestCase):
    def setUp(self):
        import app.models  # noqa: F401
        from app.api.media import media_routes

        self.app = Flask(__name__)
        self.app.config.update(SQLALCHEMY_DATABASE_URI="sqlite://", SQLALCHEMY_TRACK_MODIFICATIONS=False)
        db.init_app(self.app)
        api = Api(self.app)
        api.add_namespace(media_routes.api, path="/api/media")
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()
        self.client = self.app.test_client()
        self.addCleanup(self._teardown)

        from app.models import Chat, Media, User

        self.sender = User(keycloak_id="kc-sender", username="sender", email="s@example.test")
        self.receiver = User(keycloak_id="kc-receiver", username="receiver", email="r@example.test")
        self.stranger = User(keycloak_id="kc-stranger", username="stranger", email="x@example.test")
        db.session.add_all([self.sender, self.receiver, self.stranger])
        db.session.commit()

        self.public = Media(content=b"PUBLIC", content_type="image/png", filename="p.png",
                            user_id=self.sender.id, is_public=True)
        self.private = Media(content=b"PRIVATE", content_type="image/png", filename="c.png",
                             user_id=self.sender.id, is_public=False)
        self.unsent = Media(content=b"DRAFT", content_type="image/png", filename="d.png",
                            user_id=self.sender.id, is_public=False)
        db.session.add_all([self.public, self.private, self.unsent])
        db.session.commit()
        db.session.add(Chat(sender_id=self.sender.id, receiver_id=self.receiver.id,
                            message="hi", media_id=self.private.id))
        db.session.commit()

        def fake_verify(token):
            return {"sub": token} if token.startswith("kc-") else None

        patcher = mock.patch("app.utils.utils.verify_jwt", side_effect=fake_verify)
        patcher.start()
        self.addCleanup(patcher.stop)

    def _teardown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def _get(self, media, token=None):
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        return self.client.get(f"/api/media/{media.id}", headers=headers)

    def test_public_file_needs_no_sign_in(self):
        response = self._get(self.public)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, b"PUBLIC")

    def test_private_file_refuses_when_not_signed_in(self):
        self.assertEqual(self._get(self.private).status_code, 401)

    def test_private_file_refuses_an_invalid_token(self):
        self.assertEqual(self._get(self.private, "garbage").status_code, 401)

    def test_private_file_is_hidden_from_a_stranger(self):
        self.assertEqual(self._get(self.private, "kc-stranger").status_code, 404)

    def test_sender_and_receiver_can_open_it(self):
        for token in ("kc-sender", "kc-receiver"):
            response = self._get(self.private, token)
            self.assertEqual(response.status_code, 200, token)
            self.assertEqual(response.data, b"PRIVATE")
            self.assertIn("no-store", response.headers["Cache-Control"])

    def test_unsent_upload_is_visible_only_to_its_owner(self):
        self.assertEqual(self._get(self.unsent, "kc-sender").status_code, 200)
        self.assertEqual(self._get(self.unsent, "kc-receiver").status_code, 404)

    def test_metadata_follows_the_same_rule(self):
        def meta(media, token=None):
            headers = {"Authorization": f"Bearer {token}"} if token else {}
            return self.client.get(f"/api/media/{media.id}/metadata", headers=headers).status_code

        self.assertEqual(meta(self.public), 200)
        self.assertEqual(meta(self.private), 404)
        self.assertEqual(meta(self.private, "kc-stranger"), 404)
        self.assertEqual(meta(self.private, "kc-receiver"), 200)

    def test_private_file_in_object_storage_is_streamed_through_the_api(self):
        from app.models import Media

        stored = Media(content=None, content_type="image/png", filename="s.png", user_id=self.sender.id,
                       is_public=False, s3_url="media/0b9d5e1c-3f1a-4c52-8a9e-6f2d7c1b4a10/s.png")
        db.session.add(stored)
        db.session.commit()
        body = mock.Mock()
        body.read.return_value = b"FROM-SPACES"
        with mock.patch("app.services.media.media_processor.ObjectStorage") as storage:
            storage.return_value.client.get_object.return_value = body
            storage.return_value.bucket = "bucket"
            response = self._get(stored, "kc-sender")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, b"FROM-SPACES")
        storage.return_value.client.get_object.assert_called_once_with(
            "bucket", "media/0b9d5e1c-3f1a-4c52-8a9e-6f2d7c1b4a10/s.png")

    def test_privatise_marks_only_attached_files(self):
        from app.models import Media
        from app.services.retention_service import privatise_chat_media

        attached = Media(content=b"x", content_type="image/png", filename="a.png", user_id=self.sender.id, is_public=True)
        loose = Media(content=b"y", content_type="image/png", filename="b.png", user_id=self.sender.id, is_public=True)
        db.session.add_all([attached, loose])
        db.session.commit()
        from app.models import Chat

        db.session.add(Chat(sender_id=self.sender.id, receiver_id=self.receiver.id, message="m", media_id=attached.id))
        db.session.commit()
        self.assertEqual(privatise_chat_media(dry_run=True), 1)
        self.assertEqual(privatise_chat_media(), 1)
        db.session.refresh(attached)
        db.session.refresh(loose)
        self.assertFalse(attached.is_public)
        self.assertTrue(loose.is_public)
        self.assertEqual(privatise_chat_media(), 0)


if __name__ == "__main__":
    unittest.main()
