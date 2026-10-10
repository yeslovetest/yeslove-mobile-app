import unittest
from unittest import mock

from flask import Flask
from flask_restx import Api

from app import db

BASE = {
    "email": "jane@example.com",
    "confirm_email": "jane@example.com",
    "password": "secret-pass-1",
    "confirm_password": "secret-pass-1",
    "first_name": "Jane",
    "last_name": "Doe",
    "username": "janedoe",
    "phone_number": "",
}


def _resp(status, body=None):
    r = mock.Mock(status_code=status, text="")
    r.json.return_value = body if body is not None else {}
    return r


class SignupTests(unittest.TestCase):
    def setUp(self):
        import app.models  # noqa: F401
        from app.api.auth import auth_routes

        self.routes = auth_routes
        self.app = Flask(__name__)
        self.app.config.update(
            SQLALCHEMY_DATABASE_URI="sqlite://",
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            KEYCLOAK_SERVER_URL="http://kc.test",
            KEYCLOAK_REALM_NAME="realm",
            KEYCLOAK_ADMIN_USER="admin",
            KEYCLOAK_ADMIN_PASS="pw",
        )
        db.init_app(self.app)
        api = Api(self.app)
        api.add_namespace(auth_routes.api, path="/api/auth")
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()
        self.client = self.app.test_client()
        self.addCleanup(self._teardown)

        patcher = mock.patch.object(auth_routes, "is_valid_email", return_value=True)
        patcher.start()
        self.addCleanup(patcher.stop)
        self.req = mock.patch.object(auth_routes, "requests").start()
        self.addCleanup(mock.patch.stopall)
        self.req.RequestException = Exception
        # Defaults: Keycloak accepts everything.
        self.req.post.side_effect = [_resp(200, {"access_token": "t"}), _resp(201)]
        self.req.get.return_value = _resp(200, [{"id": "kc-123"}])
        self.req.put.return_value = _resp(204)
        self.req.delete.return_value = _resp(204)

    def _teardown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def _post(self, **extra):
        return self.client.post("/api/auth/signup", json={**BASE, **extra})

    def test_member_without_user_type_can_sign_up(self):
        from app.models import User

        response = self._post()
        self.assertEqual(response.status_code, 201, response.get_json())
        user = User.query.filter_by(username="janedoe").one()
        self.assertEqual(user.user_type, "standard")
        self.assertEqual(user.keycloak_id, "kc-123")
        self.req.delete.assert_not_called()

    def test_professional_details_are_saved(self):
        from app.models import ProfessionalDetails

        response = self._post(user_type="Professional", license_body="HCPC", license_number="PYL12345",
                              consent_license_data="Yes")
        self.assertEqual(response.status_code, 201, response.get_json())
        details = ProfessionalDetails.query.one()
        self.assertEqual(details.license_body, "HCPC")
        self.assertTrue(details.consent_license_data)

    def test_professional_without_consent_is_rejected_before_keycloak(self):
        response = self._post(user_type="Professional", license_body="HCPC", license_number="1",
                              consent_license_data="No")
        self.assertEqual(response.status_code, 400)
        self.req.post.assert_not_called()

    def test_failed_verification_email_removes_the_keycloak_user(self):
        self.req.put.side_effect = [_resp(204), _resp(500)]  # required action ok, send email fails
        response = self._post()
        self.assertEqual(response.status_code, 500)
        self.req.delete.assert_called_once()
        self.assertIn("kc-123", self.req.delete.call_args.args[0])

    def test_duplicate_username_in_app_database_removes_the_keycloak_user(self):
        from app.models import User

        db.session.add(User(keycloak_id="other", username="janedoe", email="x@example.com"))
        db.session.commit()
        response = self._post()
        self.assertEqual(response.status_code, 409)
        self.req.delete.assert_called_once()

    def test_short_password_is_refused_before_keycloak_is_called(self):
        response = self._post(password="short-pw-11", confirm_password="short-pw-11")
        self.assertEqual(response.status_code, 400)
        self.assertIn("at least 12 characters", response.get_json()["message"])
        self.req.post.assert_not_called()

    def test_password_of_exactly_twelve_characters_is_accepted(self):
        response = self._post(password="exactly12chr", confirm_password="exactly12chr")
        self.assertEqual(response.status_code, 201, response.get_json())

    def test_password_matching_username_or_email_is_refused(self):
        for same in ("JaneDoe12345", "jane@example.com"):
            self.req.post.reset_mock()
            response = self._post(username=same.split("@")[0] if "@" in same else same,
                                  password=same, confirm_password=same)
            self.assertEqual(response.status_code, 400, same)
            self.assertIn("username or email", response.get_json()["message"])
            self.req.post.assert_not_called()

    def test_password_problem_helper(self):
        problem = self.routes.password_problem
        self.assertIsNone(problem("a-long-enough-one", "someone", "x@example.com"))
        self.assertIn("12 characters", problem("short", "someone"))
        self.assertIn("username or email", problem("Someone12345", "someone12345"))


if __name__ == "__main__":
    unittest.main()
