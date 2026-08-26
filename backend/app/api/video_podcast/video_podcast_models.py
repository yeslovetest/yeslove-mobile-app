from .video_podcast_routes import api
from flask_restx import fields

CreateVideoPodcast = api.model("CreateVideoPodcast", {
    "title": fields.String(required=True, description="Video podcast title"),
    "description": fields.String(required=False, description="Short searchable description"),
    "transcript": fields.String(required=False, description="Transcript or detailed notes for chatbot retrieval"),
    "video_url": fields.String(required=True, description="Public URL users can open to watch the video"),
    "thumbnail_url": fields.String(required=False, description="Optional thumbnail URL"),
    "tags": fields.List(fields.String, required=False, description="Search/recommendation tags"),
    "published_at": fields.String(required=False, description="Published timestamp in ISO 8601"),
})

VideoPodcastModel = api.model("VideoPodcastModel", {
    "id": fields.Integer(description="Video podcast ID"),
    "wp_post_id": fields.Integer(description="WordPress post ID"),
    "source": fields.String(description="Source system"),
    "title": fields.String(description="Video podcast title"),
    "description": fields.String(description="Short searchable description"),
    "transcript": fields.String(description="Transcript or detailed notes"),
    "video_url": fields.String(description="Public watch URL"),
    "thumbnail_url": fields.String(description="Thumbnail URL"),
    "tags": fields.List(fields.String, description="Tags"),
    "slug": fields.String(description="WordPress slug"),
    "link": fields.String(description="WordPress post URL"),
    "url": fields.String(description="Public content URL"),
    "author_id": fields.Integer(description="Author user ID"),
    "author": fields.String(description="Author username"),
    "published_at": fields.String(description="Published timestamp"),
    "created_at": fields.String(description="Created timestamp"),
    "updated_at": fields.String(description="Updated timestamp"),
    "synced_at": fields.String(description="Last cache sync timestamp"),
})

VideoPodcastList = api.model("VideoPodcastList", {
    "items": fields.List(fields.Nested(VideoPodcastModel)),
    "total": fields.Integer(description="Total matching videos"),
    "page": fields.Integer(description="Current page"),
    "per_page": fields.Integer(description="Items per page"),
})
