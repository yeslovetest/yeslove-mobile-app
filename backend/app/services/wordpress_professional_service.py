"""Read the website professional directory without copying WordPress accounts."""
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


def fetch_professionals(page, per_page, search=""):
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
