import json
from datetime import datetime, timezone

from flask import current_app, request
from flask_restx import Namespace, Resource

from app.logging_setup import setup_logger
from app.utils import require_auth

api = Namespace("video-podcasts", description="Video Podcast Endpoints")
logger = setup_logger()


def _is_admin() -> bool:
    roles = request.user.get("realm_access", {}).get("roles", [])
    return "admin" in roles


def _parse_datetime(value):
    if not value:
        return datetime.utcnow()
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo:
            return parsed.astimezone(timezone.utc).replace(tzinfo=None)
        return parsed
    except ValueError:
        return None


def _serialize_tags(tags):
    if tags is None:
        return None
    if isinstance(tags, list):
        return json.dumps([str(tag).strip() for tag in tags if str(tag).strip()])
    if isinstance(tags, str):
        return json.dumps([tag.strip() for tag in tags.split(",") if tag.strip()])
    return None


def _public_video_url(video):
    if getattr(video, "source", None) == "wordpress" and getattr(video, "link", None):
        return video.link

    template = current_app.config.get("VIDEO_PODCAST_PUBLIC_URL_TEMPLATE")
    if not template:
        return video.video_url
    return template.format(video_id=video.id, id=video.id)


def _sync_video_to_chatbot(video):
    try:
        from app.services.chatbot_client import ChatbotClient

        result = ChatbotClient(timeout=5).sync_video_podcast(video, url=_public_video_url(video))
        if result.get("error"):
            logger.error(f"Failed to sync video podcast {video.id} to chatbot: {result['error']}")
        else:
            logger.info(f"Synced video podcast {video.id} to chatbot")
    except Exception as err:
        logger.error(f"Failed to sync video podcast {video.id} to chatbot: {err}")


@api.route("")
@api.route("/")
class VideoPodcasts(Resource):
    from .video_podcast_models import CreateVideoPodcast, VideoPodcastList

    @api.doc(description="List video podcasts with pagination and search")
    @api.param("page", "Page number (default 1)", type="integer")
    @api.param("per_page", "Items per page (default 10, max 100)", type="integer")
    @api.param("q", "Search string for title, description, transcript, or tags")
    @api.response(200, "Success", VideoPodcastList)
    @api.marshal_with(VideoPodcastList)
    def get(self):
        from app.models import VideoPodcast

        try:
            page = max(int(request.args.get("page", 1)), 1)
        except ValueError:
            page = 1

        try:
            per_page = int(request.args.get("per_page", 10))
        except ValueError:
            per_page = 10

        per_page = max(1, min(per_page, 100))
        query = VideoPodcast.query

        q = request.args.get("q")
        if q:
            ilike = f"%{q}%"
            query = query.filter(
                (VideoPodcast.title.ilike(ilike)) |
                (VideoPodcast.description.ilike(ilike)) |
                (VideoPodcast.transcript.ilike(ilike)) |
                (VideoPodcast.tags.ilike(ilike))
            )

        pagination = query.order_by(VideoPodcast.published_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False,
        )

        return {
            "items": [video.to_dict() for video in pagination.items],
            "total": pagination.total,
            "page": page,
            "per_page": per_page,
        }, 200

    @require_auth()
    @api.doc(security="Bearer", description="Create a video podcast resource (Admin only)")
    @api.expect(CreateVideoPodcast)
    @api.response(201, "Video podcast created successfully")
    @api.response(400, "Title and video_url are required")
    @api.response(403, "Access denied. Admins only")
    @api.response(404, "Authenticated user not found")
    def post(self):
        from app.models import User, VideoPodcast, db

        if not _is_admin():
            return {"message": "Access denied. Admins only."}, 403

        data = request.get_json() or {}
        title = data.get("title")
        video_url = data.get("video_url")
        if not title or not video_url:
            return {"message": "Title and video_url are required"}, 400

        published_at = _parse_datetime(data.get("published_at"))
        if published_at is None:
            return {"message": "published_at must be a valid ISO 8601 datetime"}, 400

        user = User.query.filter_by(keycloak_id=request.user["keycloak_id"]).first()
        if not user:
            return {"message": "Authenticated user not found"}, 404

        try:
            video = VideoPodcast(
                title=title,
                description=data.get("description"),
                transcript=data.get("transcript"),
                video_url=video_url,
                thumbnail_url=data.get("thumbnail_url"),
                tags=_serialize_tags(data.get("tags")),
                author_id=user.id,
                published_at=published_at,
            )
            db.session.add(video)
            db.session.commit()

            _sync_video_to_chatbot(video)

            return {
                "message": "Video podcast created successfully",
                "video_id": video.id,
            }, 201
        except Exception:
            db.session.rollback()
            logger.exception("Error creating video podcast")
            return {"message": "An error occurred while creating the video podcast."}, 500


@api.route("/sync")
class SyncVideoPodcasts(Resource):
    @require_auth()
    @api.doc(security="Bearer", description="Refresh cached video podcasts from WordPress")
    @api.param("page", "WordPress page number (default 1)", type="integer")
    @api.param("per_page", "Items per page (default 10, max 100)", type="integer")
    @api.param("sync_chatbot", "Sync refreshed videos to chatbot service", type="boolean")
    @api.response(200, "Video podcast cache refreshed")
    @api.response(403, "Access denied. Admins only")
    @api.response(502, "Could not refresh from WordPress")
    def post(self):
        import requests
        from app.services.wordpress_video_service import sync_wordpress_videos_to_db

        if not _is_admin():
            return {"message": "Access denied. Admins only."}, 403

        try:
            page = max(int(request.args.get("page", 1)), 1)
        except ValueError:
            page = 1

        try:
            per_page = int(request.args.get("per_page", 10))
        except ValueError:
            per_page = 10

        per_page = max(1, min(per_page, 100))
        sync_chatbot = request.args.get("sync_chatbot", "true").lower() in {"1", "true", "yes"}

        try:
            items, total, total_pages = sync_wordpress_videos_to_db(page=page, per_page=per_page, sync_chatbot=sync_chatbot)
        except requests.RequestException:
            logger.exception("Error syncing WordPress video podcasts")
            return {"message": "Could not refresh video podcasts from WordPress"}, 502

        return {
            "message": "Video podcast cache refreshed from WordPress",
            "items": items,
            "total": total,
            "total_pages": total_pages,
            "page": page,
            "per_page": per_page,
        }, 200


@api.route("/<int:video_id>")
class VideoPodcastDetail(Resource):
    from .video_podcast_models import VideoPodcastModel

    @api.doc(description="Retrieve a single video podcast by ID")
    @api.response(200, "Success", VideoPodcastModel)
    @api.response(404, "Video podcast not found")
    @api.marshal_with(VideoPodcastModel)
    def get(self, video_id):
        from app.models import VideoPodcast

        video = VideoPodcast.query.get(video_id)
        if not video:
            return {"message": "Video podcast not found"}, 404
        return video.to_dict(), 200
