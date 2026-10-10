"""Copy the website professional directory into our own database.

The WordPress application password is used only here, by the sync job. The app and the API
never contact WordPress: they read the copy in `wordpress_professionals`.
"""
from datetime import datetime
from html import unescape
from urllib.parse import urlsplit

import requests
from bs4 import BeautifulSoup
from flask import current_app


class DirectoryError(Exception):
    def __init__(self, message, status=502):
        super().__init__(message)
        self.status = status


def plain_text(value):
    soup = BeautifulSoup(value or "", "html.parser")
    for tag in soup(["script", "style"]):
        tag.decompose()
    return unescape(soup.get_text(" ", strip=True))


def safe_url(value):
    if isinstance(value, str) and urlsplit(value).scheme in ("http", "https"):
        return value
    return None


def directory_configured():
    config = current_app.config
    base = (config.get("WORDPRESS_DIRECTORY_API_URL") or "").rstrip("/")
    return bool(config.get("WORDPRESS_DIRECTORY_USERNAME") and config.get("WORDPRESS_DIRECTORY_APPLICATION_PASSWORD")
                and config.get("WORDPRESS_PROFESSIONAL_ROLE") and urlsplit(base).scheme == "https")


def fetch_professionals(page, per_page, search=""):
    """One page of professionals from WordPress (used by the sync job only)."""
    config = current_app.config
    base = config["WORDPRESS_DIRECTORY_API_URL"].rstrip("/")
    username = config.get("WORDPRESS_DIRECTORY_USERNAME")
    password = config.get("WORDPRESS_DIRECTORY_APPLICATION_PASSWORD")
    role = config.get("WORDPRESS_PROFESSIONAL_ROLE")
    if not username or not password or not role or urlsplit(base).scheme != "https":
        raise DirectoryError("The professional directory is not configured yet.", 503)
    try:
        response = requests.get(
            base + "/users",
            auth=(username, password),
            params={"roles": role, "context": "view", "page": page,
                    "per_page": per_page, "search": search,
                    "orderby": "name", "order": "asc",
                    "_fields": "id,name,description,avatar_urls"},
            timeout=(3, 10), allow_redirects=False,
        )
    except requests.Timeout as exc:
        raise DirectoryError("The professional directory timed out. Please try again.", 504) from exc
    except requests.RequestException as exc:
        raise DirectoryError("The professional directory is unavailable. Please try again.") from exc
    if response.status_code != 200:
        raise DirectoryError("The professional directory is unavailable. Please try again.")
    try:
        users = response.json()
        if not isinstance(users, list):
            raise ValueError("Expected a user list")
        total = int(response.headers["X-WP-Total"])
        pages = int(response.headers["X-WP-TotalPages"])
        professionals = []
        for user in users:
            if not isinstance(user, dict) or not isinstance(user.get("id"), int) or not isinstance(user.get("name"), str):
                raise ValueError("Invalid directory entry")
            avatars = user.get("avatar_urls") or {}
            avatar = next((safe_url(avatars[size]) for size in sorted(avatars, key=int, reverse=True)
                           if safe_url(avatars[size])), None)
            professionals.append({
                "id": user["id"], "source": "wordpress", "keycloak_id": None,
                "username": plain_text(user["name"]), "bio": plain_text(user.get("description")),
                "profile_pic": avatar, "specialization": None, "license_body": None,
            })
    except (ValueError, TypeError, KeyError, AttributeError) as exc:
        raise DirectoryError("The professional directory returned an invalid response.") from exc
    return {"professionals": professionals, "pagination": {
        "page": page, "per_page": per_page, "total_professionals": total,
        "total_pages": pages, "has_next": page < pages, "has_prev": page > 1,
    }}



def ensure_professional_table(db):
    """Create the table if it is missing (production schema is not migrated on deploy)."""
    from app.models import WordPressProfessional

    WordPressProfessional.__table__.create(bind=db.engine, checkfirst=True)


def sync_professionals(per_page=100):
    """Refresh our copy from WordPress. Returns {"added", "updated", "removed", "total"}.

    Everything is fetched before anything is written, so a failure part-way leaves the
    existing copy untouched. If WordPress suddenly returns nobody while we hold a copy, the
    copy is kept (an empty answer after an outage or a role change should not wipe the list).
    """
    from app import db
    from app.models import WordPressProfessional

    fetched, page = [], 1
    while True:
        result = fetch_professionals(page, per_page)
        fetched.extend(result["professionals"])
        if not result["pagination"]["has_next"]:
            break
        page += 1

    ensure_professional_table(db)
    existing = {row.wp_user_id: row for row in WordPressProfessional.query.all()}
    if not fetched and existing:
        raise DirectoryError("WordPress returned no professionals; the existing copy was kept.", 502)

    now, added, updated = datetime.utcnow(), 0, 0
    seen = set()
    for item in fetched:
        seen.add(item["id"])
        row = existing.get(item["id"])
        if row is None:
            row = WordPressProfessional(wp_user_id=item["id"])
            db.session.add(row)
            added += 1
        elif (row.name, row.bio, row.avatar_url) != (item["username"], item["bio"], item["profile_pic"]):
            updated += 1
        row.name = item["username"][:255]
        row.bio = item["bio"]
        row.avatar_url = (item["profile_pic"] or None) and item["profile_pic"][:500]
        row.synced_at = now
    removed = 0
    for wp_user_id, row in existing.items():
        if wp_user_id not in seen:
            db.session.delete(row)
            removed += 1
    db.session.commit()
    return {"added": added, "updated": updated, "removed": removed, "total": len(seen)}


def list_cached_professionals(page, per_page, search=""):
    """A page of the copy, in the same shape the app already expects."""
    from app.models import WordPressProfessional

    query = WordPressProfessional.query
    if search:
        query = query.filter(WordPressProfessional.name.ilike(f"%{search}%"))
    paginated = query.order_by(WordPressProfessional.name).paginate(page=page, per_page=per_page, error_out=False)
    return {"professionals": [{
        "id": row.wp_user_id, "source": "wordpress", "keycloak_id": None,
        "username": row.name, "bio": row.bio or "", "profile_pic": row.avatar_url,
        "specialization": None, "license_body": None,
    } for row in paginated.items], "pagination": {
        "page": paginated.page, "per_page": paginated.per_page,
        "total_professionals": paginated.total, "total_pages": paginated.pages,
        "has_next": paginated.has_next, "has_prev": paginated.has_prev,
    }}
