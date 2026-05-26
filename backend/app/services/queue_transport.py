import json
import os
import time
import uuid
from abc import ABC, abstractmethod
from typing import Any, Dict, List

import pika
import redis
from flask import current_app


class QueueTransport(ABC):
    """Transport contract for background job delivery."""

    @abstractmethod
    def send_message(self, message_body: Dict[str, Any], delay_seconds: int = 0) -> bool:
        raise NotImplementedError

    @abstractmethod
    def receive_messages(self, max_messages: int = 10) -> List[Dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    def delete_message(self, receipt_handle: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    def change_message_visibility(self, receipt_handle: str, visibility_timeout: int) -> bool:
        raise NotImplementedError

    @abstractmethod
    def send_to_dlq(self, message_body: str) -> bool:
        raise NotImplementedError


class RedisQueueTransport(QueueTransport):
    """
    Redis-backed queue transport.

    It returns messages in an SQS-like shape so the worker and callers remain
    transport-agnostic while we keep the migration surface small.
    """

    def __init__(self):
        self.queue_name = os.getenv("QUEUE_NAME", "yeslove:jobs")
        self.dlq_name = os.getenv("QUEUE_DLQ_NAME", f"{self.queue_name}:dlq")
        self.pending_name = os.getenv("QUEUE_PENDING_NAME", f"{self.queue_name}:pending")
        self.delayed_name = os.getenv("QUEUE_DELAYED_NAME", f"{self.queue_name}:delayed")
        self.poll_wait = int(os.getenv("QUEUE_POLL_WAIT", 20))
        redis_url = os.getenv("QUEUE_REDIS_URL", os.getenv("REDIS_URL", "redis://localhost:6379/0"))
        self.redis_client = redis.Redis.from_url(redis_url, decode_responses=True)

    def send_message(self, message_body: Dict[str, Any], delay_seconds: int = 0) -> bool:
        try:
            envelope = {"payload": message_body, "receive_count": 1}
            encoded = json.dumps(envelope)
            if delay_seconds > 0:
                score = time.time() + delay_seconds
                self.redis_client.zadd(self.delayed_name, {encoded: score})
            else:
                self.redis_client.lpush(self.queue_name, encoded)
            return True
        except Exception as e:
            current_app.logger.error(f"Redis queue send error: {e}")
            return False

    def receive_messages(self, max_messages: int = 10) -> List[Dict[str, Any]]:
        messages = []
        try:
            self._promote_delayed_messages()
            for _ in range(max_messages):
                queue_item = self.redis_client.rpop(self.queue_name)
                if queue_item is None and not messages:
                    queue_item = self.redis_client.brpop(self.queue_name, timeout=self.poll_wait)
                    if queue_item:
                        _, queue_item = queue_item
                if not queue_item:
                    break

                envelope = json.loads(queue_item)
                receipt_handle = str(uuid.uuid4())
                self.redis_client.hset(self.pending_name, receipt_handle, queue_item)

                messages.append(
                    {
                        "MessageId": receipt_handle,
                        "ReceiptHandle": receipt_handle,
                        "Body": json.dumps(envelope["payload"]),
                        "Attributes": {
                            "ApproximateReceiveCount": str(envelope.get("receive_count", 1))
                        },
                    }
                )
            return messages
        except Exception as e:
            current_app.logger.error(f"Redis queue receive error: {e}")
            return []

    def delete_message(self, receipt_handle: str) -> bool:
        try:
            self.redis_client.hdel(self.pending_name, receipt_handle)
            return True
        except Exception as e:
            current_app.logger.error(f"Redis queue delete error: {e}")
            return False

    def change_message_visibility(self, receipt_handle: str, visibility_timeout: int) -> bool:
        try:
            queue_item = self.redis_client.hget(self.pending_name, receipt_handle)
            if not queue_item:
                return False

            envelope = json.loads(queue_item)
            envelope["receive_count"] = int(envelope.get("receive_count", 1)) + 1
            self.redis_client.hdel(self.pending_name, receipt_handle)
            self.redis_client.zadd(
                self.delayed_name,
                {json.dumps(envelope): time.time() + visibility_timeout},
            )
            return True
        except Exception as e:
            current_app.logger.error(f"Redis queue visibility change error: {e}")
            return False

    def send_to_dlq(self, message_body: str) -> bool:
        try:
            self.redis_client.lpush(self.dlq_name, message_body)
            return True
        except Exception as e:
            current_app.logger.error(f"Redis DLQ send error: {e}")
            return False

    def _promote_delayed_messages(self) -> None:
        now = time.time()
        ready_items = self.redis_client.zrangebyscore(self.delayed_name, min=0, max=now)
        if not ready_items:
            return

        for item in ready_items:
            self.redis_client.lpush(self.queue_name, item)
            self.redis_client.zrem(self.delayed_name, item)


class RabbitMQQueueTransport(QueueTransport):
    """
    RabbitMQ-backed queue transport.

    This keeps the same message contract used by the current worker. Delayed
    retries are implemented with per-delay TTL queues that dead-letter back to
    the primary queue, which avoids requiring RabbitMQ plugins.
    """

    def __init__(self):
        self.queue_name = os.getenv("QUEUE_NAME", "yeslove.jobs")
        self.dlq_name = os.getenv("QUEUE_DLQ_NAME", f"{self.queue_name}.dlq")
        self.max_priority = int(os.getenv("QUEUE_MAX_PRIORITY", 10))
        rabbitmq_url = os.getenv("QUEUE_RABBITMQ_URL", "amqp://guest:guest@localhost:5672/%2F")
        params = pika.URLParameters(rabbitmq_url)
        self.connection = pika.BlockingConnection(params)
        self.channel = self.connection.channel()
        self._pending_deliveries: Dict[str, Dict[str, Any]] = {}
        self._declare_queue(self.queue_name)
        self._declare_queue(self.dlq_name)

    def send_message(self, message_body: Dict[str, Any], delay_seconds: int = 0) -> bool:
        try:
            envelope = {"payload": message_body, "receive_count": 1}
            target_queue = self.queue_name
            properties = pika.BasicProperties(delivery_mode=2)

            if delay_seconds > 0:
                target_queue = self._delay_queue_name(delay_seconds)
                self._declare_delay_queue(target_queue, delay_seconds)
                properties = pika.BasicProperties(
                    delivery_mode=2,
                    expiration=str(delay_seconds * 1000),
                )

            self.channel.basic_publish(
                exchange="",
                routing_key=target_queue,
                body=json.dumps(envelope),
                properties=properties,
            )
            return True
        except Exception as e:
            current_app.logger.error(f"RabbitMQ queue send error: {e}")
            return False

    def receive_messages(self, max_messages: int = 10) -> List[Dict[str, Any]]:
        messages = []
        try:
            for _ in range(max_messages):
                method, properties, body = self.channel.basic_get(self.queue_name, auto_ack=False)
                if not method:
                    break

                queue_item = body.decode("utf-8")
                envelope = json.loads(queue_item)
                receipt_handle = str(uuid.uuid4())
                self._pending_deliveries[receipt_handle] = {
                    "delivery_tag": method.delivery_tag,
                    "queue_item": queue_item,
                }
                messages.append(
                    {
                        "MessageId": receipt_handle,
                        "ReceiptHandle": receipt_handle,
                        "Body": json.dumps(envelope["payload"]),
                        "Attributes": {
                            "ApproximateReceiveCount": str(envelope.get("receive_count", 1))
                        },
                    }
                )
            return messages
        except Exception as e:
            current_app.logger.error(f"RabbitMQ queue receive error: {e}")
            return []

    def delete_message(self, receipt_handle: str) -> bool:
        try:
            pending = self._pending_deliveries.pop(receipt_handle, None)
            if not pending:
                return False
            self.channel.basic_ack(delivery_tag=pending["delivery_tag"])
            return True
        except Exception as e:
            current_app.logger.error(f"RabbitMQ queue delete error: {e}")
            return False

    def change_message_visibility(self, receipt_handle: str, visibility_timeout: int) -> bool:
        try:
            pending = self._pending_deliveries.pop(receipt_handle, None)
            if not pending:
                return False

            envelope = json.loads(pending["queue_item"])
            envelope["receive_count"] = int(envelope.get("receive_count", 1)) + 1
            self.channel.basic_ack(delivery_tag=pending["delivery_tag"])

            delay_queue = self._delay_queue_name(visibility_timeout)
            self._declare_delay_queue(delay_queue, visibility_timeout)
            self.channel.basic_publish(
                exchange="",
                routing_key=delay_queue,
                body=json.dumps(envelope),
                properties=pika.BasicProperties(
                    delivery_mode=2,
                    expiration=str(visibility_timeout * 1000),
                ),
            )
            return True
        except Exception as e:
            current_app.logger.error(f"RabbitMQ queue visibility change error: {e}")
            return False

    def send_to_dlq(self, message_body: str) -> bool:
        try:
            self.channel.basic_publish(
                exchange="",
                routing_key=self.dlq_name,
                body=message_body,
                properties=pika.BasicProperties(delivery_mode=2),
            )
            return True
        except Exception as e:
            current_app.logger.error(f"RabbitMQ DLQ send error: {e}")
            return False

    def _declare_queue(self, name: str, arguments: Dict[str, Any] | None = None) -> None:
        self.channel.queue_declare(queue=name, durable=True, arguments=arguments or {})

    def _declare_delay_queue(self, name: str, delay_seconds: int) -> None:
        self._declare_queue(
            name,
            {
                "x-message-ttl": delay_seconds * 1000,
                "x-dead-letter-exchange": "",
                "x-dead-letter-routing-key": self.queue_name,
            },
        )

    def _delay_queue_name(self, delay_seconds: int) -> str:
        return f"{self.queue_name}.delay.{delay_seconds}"


def build_queue_transport() -> QueueTransport:
    """
    Factory for the active queue transport.

    Keeping this switch in one place makes a later RabbitMQ or Kafka adapter a
    localized change instead of another app-wide migration.
    """

    provider = os.getenv("QUEUE_PROVIDER", "redis").lower()
    if provider == "redis":
        return RedisQueueTransport()
    if provider == "rabbitmq":
        return RabbitMQQueueTransport()

    raise ValueError(f"Unsupported queue provider: {provider}")
