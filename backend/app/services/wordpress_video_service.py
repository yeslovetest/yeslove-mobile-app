import json
import os
import re
from datetime import datetime
from html import unescape
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import parse_qs, urlparse

import requests
from bs4 import BeautifulSoup
from dateutil import parser as date_parser

from app.services.wordpress_blog_service import (
    WORDPRESS_SYSTEM_KEYCLOAK_ID,
    WORDPRESS_SYSTEM_EMAIL,
    WORDPRESS_SYSTEM_USERNAME,
)


def _wordpress_posts_url() -> str:
    base_url = os.getenv("WORDPRESS_BLOG_API_URL", "https://yeslove.co.uk/wp-json/wp/v2/posts")
    return base_url.rstrip("/")


def _wordpress_timeout():
    connect_timeout = float(os.getenv("WORDPRESS_CONNECT_TIMEOUT", "5"))
    read_timeout = float(os.getenv("WORDPRESS_READ_TIMEOUT", "30"))
    return connect_timeout, read_timeout


def _wordpress_headers():
    return {
        "User-Agent": os.getenv(
            "WORDPRESS_SYNC_USER_AGENT",
            "YesLoveAdminSync/1.0 (+https://yeslove.co.uk)",
        )
    }


def _rendered(value: Any) -> str:
    if isinstance(value, dict):
        value = value.get("rendered", "")
    return unescape(value or "")


def _plain_text(value: str) -> str:
    soup = BeautifulSoup(value or "", "html.parser")
    return re.sub(r"\s+", " ", soup.get_text(" ", strip=True)).strip()


def _truncate(value: Optional[str], length: int) -> Optional[str]:
    if value is None:
        return None
    return value[:length]


def _parse_datetime(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        parsed = date_parser.parse(value)
        return parsed.replace(tzinfo=None)
    except (TypeError, ValueError):
        return None


def _extract_featured_image(post: Dict[str, Any]) -> Optional[str]:
    embedded = post.get("_embedded", {})
    media = embedded.get("wp:featuredmedia", [])
    if media and isinstance(media, list):
        return media[0].get("source_url")
    return post.get("jetpack_featured_media_url")


def _normalize_youtube_url(url: str) -> str:
    parsed = urlparse(url)
    host = parsed.netloc.lower()

    if "youtube.com" in host and parsed.path.startswith("/embed/"):
        video_id = parsed.path.split("/embed/", 1)[1].split("/", 1)[0]
        return f"https://www.youtube.com/watch?v={video_id}"

    if "youtu.be" in host:
        video_id = parsed.path.strip("/").split("/", 1)[0]
        return f"https://www.youtube.com/watch?v={video_id}"

    if "youtube.com" in host:
        query = parse_qs(parsed.query)
        video_id = query.get("v", [None])[0]
        if video_id:
            return f"https://www.youtube.com/watch?v={video_id}"

    return url


def _extract_video_url(content_html: str) -> Optional[str]:
    soup = BeautifulSoup(content_html or "", "html.parser")

    for iframe in soup.find_all("iframe"):
        src = iframe.get("src")
        if src and ("youtube.com" in src or "youtu.be" in src or "vimeo.com" in src):
            return _normalize_youtube_url(src)

    match = re.search(r"https?://(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com)[^\s\"'<]+", content_html or "")
    if match:
        return _normalize_youtube_url(match.group(0))

    return None


def _get_wordpress_author_id() -> int:
    from app import db
    from app.models import User

    user = User.query.filter_by(keycloak_id=WORDPRESS_SYSTEM_KEYCLOAK_ID).first()
    if user:
        return user.id

    user = User(
        keycloak_id=WORDPRESS_SYSTEM_KEYCLOAK_ID,
        username=WORDPRESS_SYSTEM_USERNAME,
        email=WORDPRESS_SYSTEM_EMAIL,
        user_type="admin",
    )
    db.session.add(user)
    db.session.flush()
    return user.id


def normalize_wordpress_video_post(post: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    content_html = _rendered(post.get("content"))
    video_url = _extract_video_url(content_html)
    if not video_url:
        return None

    title = _plain_text(_rendered(post.get("title")))
    description = _plain_text(_rendered(post.get("excerpt"))) or None
    transcript = _plain_text(content_html) or None
    post_id = post.get("id")

    return {
        "wp_post_id": post_id,
        "source": "wordpress",
        "title": title,
        "description": description,
        "transcript": transcript,
        "video_url": video_url,
        "thumbnail_url": _extract_featured_image(post),
        "tags": ["The Love Ward Podcast", "WordPress"],
        "slug": post.get("slug"),
        "link": post.get("link"),
        "published_at": post.get("date_gmt") or post.get("date"),
        "updated_at": post.get("modified_gmt") or post.get("modified"),
    }


def fetch_wordpress_video_posts(page: int = 1, per_page: int = 10) -> Tuple[List[Dict[str, Any]], int, int]:
    params = {
        "page": page,
        "per_page": per_page,
        "_embed": 1,
        "categories": os.getenv("WORDPRESS_VIDEO_CATEGORY_ID", "201"),
    }

    response = requests.get(
        _wordpress_posts_url(),
        params=params,
        headers=_wordpress_headers(),
        timeout=_wordpress_timeout(),
    )
    response.raise_for_status()

    items = [
        video for video in (normalize_wordpress_video_post(post) for post in response.json())
        if video
    ]
    total = int(response.headers.get("X-WP-Total", len(items)))
    total_pages = int(response.headers.get("X-WP-TotalPages", 1))
    return items, total, total_pages


def upsert_wordpress_videos(videos: List[Dict[str, Any]], sync_chatbot: bool = True) -> List[Dict[str, Any]]:
    from app import db
    from app.models import VideoPodcast
    from app.api.video_podcast.video_podcast_routes import _sync_video_to_chatbot

    author_id = _get_wordpress_author_id()
    now = datetime.utcnow()
    cached = []

    for video_data in videos:
        wp_post_id = video_data.get("wp_post_id")
        if not wp_post_id:
            continue

        video = VideoPodcast.query.filter_by(wp_post_id=wp_post_id).first()
        if not video:
            video = VideoPodcast(wp_post_id=wp_post_id, author_id=author_id, source="wordpress")
            db.session.add(video)

        video.source = "wordpress"
        video.title = _truncate(video_data.get("title") or "Untitled WordPress video", 255)
        video.description = video_data.get("description")
        video.transcript = video_data.get("transcript")
        video.video_url = _truncate(video_data.get("video_url"), 1000)
        video.thumbnail_url = _truncate(video_data.get("thumbnail_url"), 1000)
        video.tags = json.dumps(video_data.get("tags") or [])
        video.slug = _truncate(video_data.get("slug"), 255)
        video.link = _truncate(video_data.get("link"), 1000)
        video.published_at = _parse_datetime(video_data.get("published_at")) or now
        video.updated_at = _parse_datetime(video_data.get("updated_at")) or now
        video.synced_at = now
        cached.append(video)

    db.session.commit()

    if sync_chatbot:
        for video in cached:
            _sync_video_to_chatbot(video)

    return [video.to_dict() for video in cached]


def sync_wordpress_videos_to_db(page: int = 1, per_page: int = 10, sync_chatbot: bool = True) -> Tuple[List[Dict[str, Any]], int, int]:
    videos, total, total_pages = fetch_wordpress_video_posts(page=page, per_page=per_page)
    return upsert_wordpress_videos(videos, sync_chatbot=sync_chatbot), total, total_pages
