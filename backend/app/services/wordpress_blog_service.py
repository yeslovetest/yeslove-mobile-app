import os
from datetime import datetime
from html import unescape
from typing import Any, Dict, List, Optional, Tuple

import requests
from dateutil import parser as date_parser


WORDPRESS_SYSTEM_KEYCLOAK_ID = "wordpress:yeslove.co.uk"
WORDPRESS_SYSTEM_USERNAME = "yeslove_wordpress"
WORDPRESS_SYSTEM_EMAIL = "wordpress@yeslove.co.uk"


def wordpress_posts_url() -> str:
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


def wordpress_edit_url(post_id: int) -> str:
    template = os.getenv(
        "WORDPRESS_POST_EDIT_URL_TEMPLATE",
        "https://yeslove.co.uk/wp-admin/post.php?post={post_id}&action=edit",
    )
    return template.format(post_id=post_id, id=post_id)


def _rendered(value: Any) -> str:
    if isinstance(value, dict):
        return unescape(value.get("rendered", ""))
    return unescape(value or "")


def _extract_featured_image(post: Dict[str, Any]) -> Optional[str]:
    embedded = post.get("_embedded", {})
    media = embedded.get("wp:featuredmedia", [])
    if media and isinstance(media, list):
        return media[0].get("source_url")
    return None


def normalize_wordpress_post(post: Dict[str, Any]) -> Dict[str, Any]:
    post_id = post.get("id")
    return {
        "id": post_id,
        "wp_post_id": post_id,
        "source_id": post_id,
        "resource_id": f"wordpress_blog:{post_id}" if post_id else None,
        "type": "blog",
        "title": _rendered(post.get("title")),
        "content": _rendered(post.get("content")),
        "summary": _rendered(post.get("excerpt")),
        "image_url": _extract_featured_image(post),
        "author_id": post.get("author"),
        "author": "YesLove",
        "timestamp": post.get("date_gmt") or post.get("date"),
        "published_at": post.get("date_gmt") or post.get("date"),
        "modified": post.get("modified_gmt") or post.get("modified"),
        "slug": post.get("slug"),
        "status": post.get("status"),
        "link": post.get("link"),
        "url": post.get("link"),
        "edit_url": wordpress_edit_url(post_id) if post_id else None,
        "source": "wordpress",
    }


def _parse_datetime(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        parsed = date_parser.parse(value)
        return parsed.replace(tzinfo=None)
    except (TypeError, ValueError):
        return None


def _truncate(value: Optional[str], length: int) -> Optional[str]:
    if value is None:
        return None
    return value[:length]


def blog_post_to_dict(post) -> Dict[str, Any]:
    return {
        "id": post.id,
        "wp_post_id": post.wp_post_id,
        "source_id": post.wp_post_id or post.id,
        "resource_id": f"wordpress_blog:{post.wp_post_id}" if post.wp_post_id else f"blog:{post.id}",
        "type": "blog",
        "title": post.title,
        "content": post.content,
        "summary": post.summary,
        "image_url": post.image_url,
        "author_id": post.author_id,
        "author": post.author.username if post.author else "YesLove",
        "timestamp": post.timestamp.isoformat() if post.timestamp else None,
        "published_at": post.timestamp.isoformat() if post.timestamp else None,
        "modified": post.modified_at.isoformat() if post.modified_at else None,
        "slug": post.slug,
        "status": post.status,
        "link": post.link,
        "url": post.link,
        "edit_url": wordpress_edit_url(post.wp_post_id) if post.wp_post_id else None,
        "source": post.source or "local",
        "synced_at": post.synced_at.isoformat() if post.synced_at else None,
    }


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


def upsert_wordpress_posts(posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    from app import db
    from app.models import BlogPost

    author_id = _get_wordpress_author_id()
    now = datetime.utcnow()
    cached_posts = []

    for post_data in posts:
        wp_post_id = post_data.get("wp_post_id") or post_data.get("id")
        if not wp_post_id:
            continue

        post = BlogPost.query.filter_by(wp_post_id=wp_post_id).first()
        if not post:
            post = BlogPost(wp_post_id=wp_post_id, author_id=author_id, source="wordpress")
            db.session.add(post)

        post.source = "wordpress"
        post.title = _truncate(post_data.get("title") or "Untitled WordPress post", 255)
        post.content = post_data.get("content") or ""
        post.summary = _truncate(post_data.get("summary"), 1000)
        post.image_url = _truncate(post_data.get("image_url"), 500)
        post.timestamp = _parse_datetime(post_data.get("timestamp")) or now
        post.status = _truncate(post_data.get("status"), 50)
        post.slug = _truncate(post_data.get("slug"), 255)
        post.link = _truncate(post_data.get("link") or post_data.get("url"), 1000)
        post.modified_at = _parse_datetime(post_data.get("modified"))
        post.synced_at = now
        cached_posts.append(post)

    db.session.commit()
    return [blog_post_to_dict(post) for post in cached_posts]


def fetch_wordpress_posts(page: int = 1, per_page: int = 10, search: Optional[str] = None) -> Tuple[List[Dict[str, Any]], int]:
    params = {
        "page": page,
        "per_page": per_page,
        "_embed": 1,
    }
    if search:
        params["search"] = search

    response = requests.get(
        wordpress_posts_url(),
        params=params,
        headers=_wordpress_headers(),
        timeout=_wordpress_timeout(),
    )
    response.raise_for_status()
    posts = [normalize_wordpress_post(post) for post in response.json()]
    total = int(response.headers.get("X-WP-Total", len(posts)))
    return posts, total


def fetch_wordpress_post(post_id: int) -> Dict[str, Any]:
    response = requests.get(
        f"{wordpress_posts_url()}/{post_id}",
        params={"_embed": 1},
        headers=_wordpress_headers(),
        timeout=_wordpress_timeout(),
    )
    response.raise_for_status()
    return normalize_wordpress_post(response.json())


def sync_wordpress_posts_to_db(page: int = 1, per_page: int = 25, search: Optional[str] = None) -> Tuple[List[Dict[str, Any]], int]:
    posts, total = fetch_wordpress_posts(page=page, per_page=per_page, search=search)
    return upsert_wordpress_posts(posts), total


def list_cached_blog_posts(page: int = 1, per_page: int = 10, search: Optional[str] = None) -> Tuple[List[Dict[str, Any]], int]:
    from app.models import BlogPost

    query = BlogPost.query.filter(BlogPost.source == "wordpress")
    if search:
        ilike = f"%{search}%"
        query = query.filter(
            (BlogPost.title.ilike(ilike)) |
            (BlogPost.content.ilike(ilike)) |
            (BlogPost.summary.ilike(ilike))
        )

    query = query.order_by(BlogPost.timestamp.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return [blog_post_to_dict(post) for post in pagination.items], pagination.total


def get_cached_blog_post(post_id: int) -> Optional[Dict[str, Any]]:
    from app.models import BlogPost

    post = BlogPost.query.filter(
        (BlogPost.id == post_id) |
        (BlogPost.wp_post_id == post_id)
    ).first()
    if not post:
        return None
    return blog_post_to_dict(post)
