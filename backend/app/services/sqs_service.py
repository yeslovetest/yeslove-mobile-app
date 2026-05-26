from typing import Any, Dict

from app.services.queue_transport import build_queue_transport


class SQSService:
    """
    Backward-compatible queue facade.

    The app still imports `SQSService`, but the transport is selected by the
    queue adapter factory so Redis can be replaced later without touching
    callers.
    """

    def __init__(self):
        self.transport = build_queue_transport()

    def send_message(self, message_body: Dict[str, Any], delay_seconds: int = 0) -> bool:
        return self.transport.send_message(message_body, delay_seconds)

    def send_notification_job(self, user_ids: list, title: str, body: str, data: Dict[str, Any] = None):
        message = {
            "job_type": "push_notification",
            "user_ids": user_ids,
            "title": title,
            "body": body,
            "data": data or {},
        }
        return self.send_message(message)

    def send_email_job(self, user_id: int, email_type: str, data: Dict[str, Any] = None):
        message = {
            "job_type": "send_email",
            "user_id": user_id,
            "email_type": email_type,
            "data": data or {},
        }
        return self.send_message(message)

    def send_media_processing_job(self, media_id: str, processing_type: str):
        message = {
            "job_type": "media_processing",
            "media_id": media_id,
            "processing_type": processing_type,
        }
        return self.send_message(message)

    def receive_messages(self, max_messages: int = 10) -> list:
        return self.transport.receive_messages(max_messages)

    def delete_message(self, receipt_handle: str) -> bool:
        return self.transport.delete_message(receipt_handle)

    def change_message_visibility(self, receipt_handle: str, visibility_timeout: int) -> bool:
        return self.transport.change_message_visibility(receipt_handle, visibility_timeout)

    def send_to_dlq(self, message_body: str) -> bool:
        return self.transport.send_to_dlq(message_body)
