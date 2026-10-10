import unittest
from unittest import mock

from flask import Flask
from flask_restx import Api

from app import db


class LoginOtpTests(unittest.TestCase):
    def setUp(self):
        import app.models  # noqa: F401
        from app.api.auth import auth_routes

        self.app = Flask(__name__)
        self.app.config.update(
            SQLALCHEMY_DATABASE_URI="sqlite://",
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            KEYCLOAK_SERVER_URL="http://kc.test",
            KEYCLOAK_REALM_NAME="realm",
            KEYCLOAK_CLIENT_ID="yeslove",
            KEYCLOAK_CLIENT_SECRET="s",
        )
        db.init_app(self.app)
        api = Api(self.app)
        api.add_namespace(auth_routes.api, path="/api/auth")
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()
        self.client = self.app.test_client()
        self.addCleanup(self._teardown)

        self.req = mock.patch.object(auth_routes, "requests").start()
        self.addCleanup(mock.patch.stopall)
        refused = mock.Mock(status_code=400, text="")
        refused.json.return_value = {"error": "invalid_grant"}
        self.req.post.return_value = refused

    def _teardown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def _login(self, **extra):
        return self.client.post("/api/auth/login", json={"username": "pro", "password": "pw", **extra})

    def _sent(self):
        return self.req.post.call_args.kwargs["data"]

    def test_no_code_sends_no_otp_field(self):
        self._login()
        self.assertNotIn("otp", self._sent())

    def test_code_is_passed_to_keycloak(self):
        self._login(otp="123456")
        self.assertEqual(self._sent()["otp"], "123456")

    def test_spaces_in_the_code_are_removed(self):
        self._login(otp="123 456")
        self.assertEqual(self._sent()["otp"], "123456")

    def test_a_malformed_code_is_rejected_before_keycloak(self):
        for bad in ("12", "abcdef", "123456789", "12345!"):
            self.req.post.reset_mock()
            response = self._login(otp=bad)
            self.assertEqual(response.status_code, 400, bad)
            self.req.post.assert_not_called()

    def test_a_keycloak_server_error_is_not_reported_as_a_wrong_password(self):
        self.req.post.return_value = mock.Mock(status_code=500, text="")
        response = self._login(otp="123456")
        self.assertEqual(response.status_code, 503)
        self.assertIn("two-step verification", response.get_json()["message"])

    def test_the_code_is_never_logged(self):
        with self.assertLogs(level="DEBUG") as logs:
            self.req.post.return_value.status_code = 400
            self._login(otp="987654")
            import logging

            logging.getLogger().info("sentinel")  # assertLogs needs at least one record
        self.assertFalse(any("987654" in line for line in logs.output))


if __name__ == "__main__":
    unittest.main()
