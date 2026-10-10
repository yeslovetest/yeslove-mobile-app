"""Copy the website professional directory into our own database.

Only the sync job contacts WordPress, and it needs no login: it reads the website's public
BuddyPress member list for the "professionals" member type. BuddyPress returns only what each
member has chosen to show publicly. The app and the API read the copy in `wordpress_professionals`.
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
    return bool(config.get("WORDPRESS_PROFESSIONAL_MEMBER_TYPE") and urlsplit(base).scheme == "https")


def _profile_values(member):
    """Public profile fields by label, e.g. {"Bio": "..."}. Empty values are left out."""
    values = {}
    for group in (member.get("xprofile") or {}).get("groups") or []:
        fields = group.get("fields") or {}
        for field in (fields.values() if isinstance(fields, dict) else fields):
            text = plain_text(((field.get("value") or {}).get("rendered")))
            if text and isinstance(field.get("name"), str):
                values.setdefault(field["name"], text)
    return values


def fetch_professionals(page, per_page, search=""):
    """One page of professional members from WordPress (used by the sync job only)."""
    config = current_app.config
    base = config["WORDPRESS_DIRECTORY_API_URL"].rstrip("/")
    if not directory_configured():
        raise DirectoryError("The professional directory is not configured yet.", 503)
    try:
        response = requests.get(
            base + "/members",
            # Do not add `type=...` here: on this site it makes BuddyPress ignore member_type and
            # return every member (33 instead of the 6 professionals). We sort in our own database.
            params={"member_type": config["WORDPRESS_PROFESSIONAL_MEMBER_TYPE"],
                    "page": page, "per_page": per_page, "search": search},
            timeout=(3, 10), allow_redirects=False,
        )
    except requests.Timeout as exc:
        raise DirectoryError("The professional directory timed out. Please try again.", 504) from exc
    except requests.RequestException as exc:
        raise DirectoryError("The professional directory is unavailable. Please try again.") from exc
    if response.status_code != 200:
        raise DirectoryError("The professional directory is unavailable. Please try again.")
    try:
        members = response.json()
        if not isinstance(members, list):
            raise ValueError("Expected a member list")
        total = int(response.headers["X-WP-Total"])
        pages = int(response.headers["X-WP-TotalPages"])
        professionals = []
        for member in members:
            if not isinstance(member, dict) or not isinstance(member.get("id"), int) or not isinstance(member.get("name"), str):
                raise ValueError("Invalid directory entry")
            profile = _profile_values(member)
            # Only name, photo and a short description are copied. Contact details, birthday and
            # gender can be public on the website but are not needed here and are never stored.
            professionals.append({
                "id": member["id"], "source": "wordpress", "keycloak_id": None,
                "username": plain_text(member["name"]),
                "bio": profile.get("Bio") or profile.get("How I can help") or "",
                "profile_pic": safe_url((member.get("avatar_urls") or {}).get("full")),
                "specialization": None, "license_body": None,
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
