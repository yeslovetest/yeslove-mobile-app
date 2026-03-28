Backup created on 2026-03-28 before replacing AWS integrations in the backend.

Scope:
- `app/aws_config.py`: AWS Secrets Manager and SSM Parameter Store access.
- `app/config.py`: production config path referencing AWS-backed secret loading and S3 toggle.
- `app/__init__.py`: optional Neptune initialization.
- `application.py`: production entry point, includes AWS deployment note.
- `app/services/sqs_service.py`: SQS queue client.
- `app/workers/sqs_worker.py`: SQS worker loop and retry handling.
- `app/workers/run_sqs_worker.py`: worker runner.
- `run_worker.py`: top-level SQS worker entry point.
- `app/services/media_processor.py`: S3 storage client and URL generation.
- `app/services/media_service.py`: media upload flow using S3.
- `app/services/push_notification_service.py`: large fan-out path using SQS.
- `app/api/blog/blog_routes.py`: blog creation path that queues notifications through SQS.
- `app/api/events/events_routes.py`: event image upload path using the S3-backed media service and event notifications that can fan out through SQS.
- `app/api/feed/feed_routes.py`: Neptune-backed feed, follow, like, and post graph operations.
- `app/api/feed/recommendations_routes.py`: recommendation path that optionally uses Neptune.
- `app/graph/neptune_client.py`: Neptune graph client.
- `app/graph/neptune_repository.py`: Neptune-backed repository abstraction.
- `app/utils/common_helpers.py`: shared Neptune wrapper used by follow routes.
- `app/monitoring/health.py`: readiness probe includes Neptune health check.
- `app/monitoring/metrics.py`: Neptune operation metrics.
- `requirements.txt`: backend dependency list including `boto3` and `gremlinpython`.

Backup location preserves the pre-migration state only. No runtime behavior was changed.
