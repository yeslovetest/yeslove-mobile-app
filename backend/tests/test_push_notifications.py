import unittest
from unittest import mock

from flask import Flask

from app.services.push_notification_service import PushNotificationService as Push

EXPO_TOKEN = "ExponentPushToken[abc123]"


def _response(status=200, body=None):
    response = mock.Mock(status_code=status)
    response.json.return_value = body if body is not None else {}
    return response


class TokenRoutingTests(unittest.TestCase):
    def test_expo_tokens_are_recognised(self):
        self.assertTrue(Push._is_expo_token("ExponentPushToken[xyz]"))
        self.assertTrue(Push._is_expo_token("ExpoPushToken[xyz]"))

    def test_other_tokens_are_not_expo(self):
        self.assertFalse(Push._is_expo_token("fcm:APA91bEXAMPLE"))
        self.assertFalse(Push._is_expo_token(None))

    def test_expo_token_goes_to_expo_and_raw_token_goes_to_fcm(self):
        with mock.patch.object(Push, "_send_expo_notification", return_value=True) as expo, \
                mock.patch.object(Push, "_send_fcm_notification", return_value=True) as fcm:
            Push._send_to_token(EXPO_TOKEN, "t", "b")
            Push._send_to_token("raw-fcm-token", "t", "b")
        expo.assert_called_once()
        fcm.assert_called_once()


class ExpoSenderTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.ctx = self.app.app_context()
        self.ctx.push()
        self.addCleanup(self.ctx.pop)

    def test_success_posts_expected_payload(self):
        with mock.patch("requests.post", return_value=_response(200, {"data": {"status": "ok", "id": "1"}})) as post:
            ok = Push._send_expo_notification(EXPO_TOKEN, "New Message", "hi", {"type": "message", "chat_id": 5})
        self.assertTrue(ok)
        payload = post.call_args.kwargs["json"]
        self.assertEqual(payload["to"], EXPO_TOKEN)
        self.assertEqual(payload["title"], "New Message")
        self.assertEqual(payload["data"], {"type": "message", "chat_id": 5})
        self.assertEqual(payload["channelId"], "default")

    def test_access_token_is_sent_when_configured(self):
        with mock.patch.dict("os.environ", {"EXPO_ACCESS_TOKEN": "secret"}), \
                mock.patch("requests.post", return_value=_response(200, {"data": {"status": "ok"}})) as post:
            Push._send_expo_notification(EXPO_TOKEN, "t", "b")
        self.assertEqual(post.call_args.kwargs["headers"]["Authorization"], "Bearer secret")

    def test_unregistered_device_token_is_removed(self):
        body = {"data": {"status": "error", "message": "gone", "details": {"error": "DeviceNotRegistered"}}}
        with mock.patch("requests.post", return_value=_response(200, body)), \
                mock.patch("app.services.device_token_service.DeviceTokenService.remove_device_token") as remove:
            ok = Push._send_expo_notification(EXPO_TOKEN, "t", "b")
        self.assertFalse(ok)
        remove.assert_called_once_with(EXPO_TOKEN)

    def test_other_errors_do_not_remove_the_token(self):
        body = {"data": {"status": "error", "message": "rate", "details": {"error": "MessageRateExceeded"}}}
        with mock.patch("requests.post", return_value=_response(200, body)), \
                mock.patch("app.services.device_token_service.DeviceTokenService.remove_device_token") as remove:
            self.assertFalse(Push._send_expo_notification(EXPO_TOKEN, "t", "b"))
        remove.assert_not_called()

    def test_http_error_returns_false(self):
        with mock.patch("requests.post", return_value=_response(500)):
            self.assertFalse(Push._send_expo_notification(EXPO_TOKEN, "t", "b"))

    def test_network_error_returns_false(self):
        with mock.patch("requests.post", side_effect=OSError("down")):
            self.assertFalse(Push._send_expo_notification(EXPO_TOKEN, "t", "b"))


if __name__ == "__main__":
    unittest.main()
