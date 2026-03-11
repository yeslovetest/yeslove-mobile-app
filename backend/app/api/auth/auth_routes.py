from __future__ import annotations

import os
from typing import Any, Dict, Optional, Tuple

import requests
from flask import current_app, request
from flask_restx import Namespace, Resource

from app.logging_setup import setup_logger
from app.utils import get_auth_provider, is_valid_email, require_auth, verify_jwt

logger = setup_logger()
api = Namespace("auth", description="API Endpoints")

REQUEST_TIMEOUT_SECONDS = 12


def _provider() -> str:
    provider = get_auth_provider()
    return provider if provider in {"supabase", "keycloak"} else "keycloak"


def _json_or_text(response: requests.Response) -> Any:
    try:
        return response.json()
    except ValueError:
        return response.text


def _extract_token_from_header(header_value: str) -> str:
    parts = (header_value or "").strip().split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return (header_value or "").strip()


def _supabase_url() -> str:
    return (os.getenv("SUPABASE_URL") or "").rstrip("/")


def _supabase_anon_key() -> Optional[str]:
    return (
        os.getenv("SUPABASE_ANON_KEY")
        or os.getenv("SUPABASE_PUBLIC_API_KEY")
        or os.getenv("SUPABASE_KEY")
    )


def _supabase_service_key() -> Optional[str]:
    return os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")


def _supabase_headers(use_service: bool = False, access_token: Optional[str] = None) -> Dict[str, str]:
    selected_key = _supabase_service_key() if use_service else (_supabase_anon_key() or _supabase_service_key())
    headers = {"Content-Type": "application/json"}

    if selected_key:
        headers["apikey"] = selected_key

    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"
    elif use_service and selected_key:
        headers["Authorization"] = f"Bearer {selected_key}"

    return headers


def _keycloak_realm_base_url() -> str:
    return (
        f"{current_app.config['KEYCLOAK_SERVER_URL'].rstrip('/')}/realms/"
        f"{current_app.config['KEYCLOAK_REALM_NAME']}"
    )


def _keycloak_admin_base_url() -> str:
    return (
        f"{current_app.config['KEYCLOAK_SERVER_URL'].rstrip('/')}/admin/realms/"
        f"{current_app.config['KEYCLOAK_REALM_NAME']}"
    )


def _fetch_keycloak_admin_token() -> Optional[str]:
    admin_user = current_app.config.get("KEYCLOAK_ADMIN_USER")
    admin_pass = current_app.config.get("KEYCLOAK_ADMIN_PASS")

    if not admin_user or not admin_pass:
        logger.error("Keycloak admin credentials are missing")
        return None

    token_url = f"{current_app.config['KEYCLOAK_SERVER_URL'].rstrip('/')}/realms/master/protocol/openid-connect/token"
    payload = {
        "grant_type": "password",
        "client_id": "admin-cli",
        "username": admin_user,
        "password": admin_pass,
    }

    try:
        response = requests.post(
            token_url,
            data=payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        logger.exception("Failed to reach Keycloak admin token endpoint")
        return None

    if response.status_code != 200:
        logger.error("Failed to fetch Keycloak admin token: %s", _json_or_text(response))
        return None

    return response.json().get("access_token")


def _truthy(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y", "on"}
    return bool(value)


def _normalize_user_type(raw_value: Optional[str], claims: Optional[Dict[str, Any]] = None) -> str:
    normalized = (raw_value or "").strip().lower()
    if normalized in {"standard", "professional"}:
        return normalized

    claim_roles = []
    claims = claims or {}
    realm_access = claims.get("realm_access") or {}
    if isinstance(realm_access, dict):
        roles = realm_access.get("roles") or []
        if isinstance(roles, list):
            claim_roles.extend([str(role).lower() for role in roles])

    direct_roles = claims.get("roles") or []
    if isinstance(direct_roles, list):
        claim_roles.extend([str(role).lower() for role in direct_roles])

    if "professional" in claim_roles:
        return "professional"

    return "standard"


def _build_safe_username(username: Optional[str], email: str, subject: str) -> str:
    base = (username or "").strip()
    if not base and email:
        base = email.split("@", 1)[0]
    if not base:
        base = subject[:20] if subject else "user"

    safe = "".join(ch for ch in base if ch.isalnum() or ch in {"_", "."}).strip("._")
    if not safe:
        safe = "user"
    return safe[:50]


def _resolve_supabase_login_email(identifier: str) -> Optional[str]:
    candidate = (identifier or "").strip().lower()
    if candidate and is_valid_email(candidate):
        return candidate

    from app.models import User

    user = User.query.filter_by(username=identifier).first()
    if user and user.email and is_valid_email(user.email):
        return user.email.lower().strip()

    return None


def _upsert_local_user(
    subject_id: str,
    email: str,
    username: str,
    user_type: str,
    phone_number: Optional[str] = None,
) -> Tuple[Any, bool]:
    from app.models import User, db

    if not subject_id:
        raise ValueError("Missing token subject")

    normalized_email = (email or "").strip().lower()
    if not normalized_email:
        normalized_email = f"{subject_id[:24]}@no-email.local"

    safe_username = _build_safe_username(username, normalized_email, subject_id)
    normalized_user_type = _normalize_user_type(user_type)

    user = User.query.filter_by(keycloak_id=subject_id).first()
    if user:
        changed = False
        if normalized_email and user.email != normalized_email:
            conflict = User.query.filter(User.email == normalized_email, User.id != user.id).first()
            if conflict:
                raise ValueError("Email is already associated with another account")
            user.email = normalized_email
            changed = True

        if safe_username and user.username != safe_username:
            existing_username = User.query.filter(User.username == safe_username, User.id != user.id).first()
            if not existing_username:
                user.username = safe_username
                changed = True

        if normalized_user_type and user.user_type != normalized_user_type:
            user.user_type = normalized_user_type
            changed = True

        if phone_number and user.phone_number != phone_number:
            user.phone_number = phone_number
            changed = True

        if changed:
            db.session.commit()

        return user, False

    existing_by_email = User.query.filter_by(email=normalized_email).first()
    if existing_by_email:
        if existing_by_email.keycloak_id and existing_by_email.keycloak_id != subject_id:
            raise ValueError("Email is already associated with another account")

        existing_by_email.keycloak_id = subject_id
        existing_by_email.user_type = normalized_user_type
        if not existing_by_email.username:
            existing_by_email.username = safe_username
        if phone_number and not existing_by_email.phone_number:
            existing_by_email.phone_number = phone_number
        db.session.commit()
        return existing_by_email, False

    unique_username = safe_username
    suffix_counter = 1
    while User.query.filter_by(username=unique_username).first():
        suffix = f"_{suffix_counter}"
        unique_username = f"{safe_username[:50 - len(suffix)]}{suffix}"
        suffix_counter += 1

    new_user = User()
    new_user.keycloak_id = subject_id
    new_user.username = unique_username
    new_user.email = normalized_email
    new_user.phone_number = phone_number
    new_user.user_type = normalized_user_type
    db.session.add(new_user)
    db.session.commit()
    return new_user, True


def _ensure_professional_details(
    user_id: int,
    license_body: Optional[str],
    license_number: Optional[str],
    consent_license_data: Any,
    specialization: Optional[str],
) -> None:
    from app.models import ProfessionalDetails, db

    details = ProfessionalDetails.query.filter_by(user_id=user_id).first()
    if details:
        changed = False
        if license_body and details.license_body != license_body:
            details.license_body = license_body
            changed = True
        if license_number and details.license_number != license_number:
            details.license_number = license_number
            changed = True
        if specialization and details.specialization != specialization:
            details.specialization = specialization
            changed = True

        consent_bool = _truthy(consent_license_data)
        if details.consent_license_data != consent_bool:
            details.consent_license_data = consent_bool
            changed = True

        if changed:
            db.session.commit()
        return

    new_details = ProfessionalDetails()
    new_details.user_id = user_id
    new_details.license_body = license_body
    new_details.license_number = license_number
    new_details.consent_license_data = _truthy(consent_license_data)
    new_details.specialization = specialization
    db.session.add(new_details)
    db.session.commit()


def _register_device_token(user_id: Optional[int], payload: Dict[str, Any]) -> None:
    if not user_id:
        return

    device_token = payload.get("device_token")
    if not device_token:
        return

    platform = payload.get("platform")
    device_id = payload.get("device_id")

    try:
        from app.services.device_token_service import DeviceTokenService

        DeviceTokenService.register_device_token(user_id, device_token, platform, device_id)
    except Exception:
        logger.exception("Failed to register device token")


def _claims_from_request() -> Dict[str, Any]:
    request_user = getattr(request, "user", {}) or {}
    claims = request_user.get("claims")
    if isinstance(claims, dict):
        return claims
    return request_user


def _sync_local_user_from_claims(claims: Dict[str, Any], payload: Dict[str, Any]) -> Tuple[Any, bool]:
    subject_id = claims.get("sub") or claims.get("keycloak_id")
    if not subject_id:
        raise ValueError("Missing token subject")

    email = (claims.get("email") or payload.get("email") or "").strip().lower()
    username = (
        claims.get("preferred_username")
        or claims.get("username")
        or (claims.get("user_metadata") or {}).get("username")
        or payload.get("username")
    )

    user_type = _normalize_user_type(payload.get("user_type"), claims)
    phone_number = payload.get("phone_number")

    user, created = _upsert_local_user(
        subject_id=subject_id,
        email=email,
        username=str(username or ""),
        user_type=user_type,
        phone_number=phone_number,
    )

    if user_type == "professional":
        _ensure_professional_details(
            user_id=user.id,
            license_body=payload.get("license_body"),
            license_number=payload.get("license_number") or payload.get("license"),
            consent_license_data=payload.get("consent_license_data"),
            specialization=payload.get("specialization"),
        )

    return user, created


def _professional_details_required(user_id: int, user_type: str) -> bool:
    if user_type != "professional":
        return False

    from app.models import ProfessionalDetails

    return ProfessionalDetails.query.filter_by(user_id=user_id).first() is None


def _normalize_supabase_token_response(raw: Dict[str, Any], user: Any) -> Dict[str, Any]:
    normalized = {
        "access_token": raw.get("access_token"),
        "token_type": raw.get("token_type", "bearer"),
        "expires_in": raw.get("expires_in"),
        "refresh_expires_in": raw.get("expires_in"),
        "refresh_token": raw.get("refresh_token"),
        "session_state": ((raw.get("user") or {}).get("id") if isinstance(raw.get("user"), dict) else None),
        "scope": ((raw.get("user") or {}).get("role") if isinstance(raw.get("user"), dict) else "authenticated"),
        "provider": "supabase",
        "keycloak_id": user.keycloak_id,
        "user_id": user.id,
    }
    return normalized


def _login_with_keycloak(payload: Dict[str, Any], username: str, password: str):
    keycloak_url = f"{_keycloak_realm_base_url()}/protocol/openid-connect/token"
    request_payload = {
        "grant_type": "password",
        "client_id": current_app.config["KEYCLOAK_CLIENT_ID"],
        "client_secret": current_app.config["KEYCLOAK_CLIENT_SECRET"],
        "username": username,
        "password": password,
    }

    try:
        response = requests.post(
            keycloak_url,
            data=request_payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        logger.exception("Keycloak login request failed")
        return {"message": "Authentication provider unavailable"}, 503

    if response.status_code != 200:
        details = _json_or_text(response)
        logger.warning("Keycloak login failed: %s", details)
        return {"message": "Invalid login credentials", "details": details}, response.status_code

    token_data = response.json()
    access_token = token_data.get("access_token")
    claims = verify_jwt(access_token) if access_token else None

    if not claims:
        return {"message": "Invalid token received from Keycloak"}, 401

    try:
        user, _ = _sync_local_user_from_claims(
            claims,
            {
                "username": username,
                "email": payload.get("email"),
                "user_type": payload.get("user_type"),
            },
        )
    except ValueError as exc:
        return {"message": str(exc)}, 409

    _register_device_token(user.id, payload)

    token_data["provider"] = "keycloak"
    token_data["keycloak_id"] = user.keycloak_id
    token_data["user_id"] = user.id

    if _professional_details_required(user.id, user.user_type):
        token_data["set_professional_details_required"] = True
        token_data["message"] = "Professional details missing. Please provide license and specialization."

    return token_data, 200


def _login_with_supabase(payload: Dict[str, Any], identifier: str, password: str):
    supabase_url = _supabase_url()
    if not supabase_url:
        return {"message": "SUPABASE_URL is not configured"}, 500

    email = _resolve_supabase_login_email(payload.get("email") or identifier)
    if not email:
        return {"message": "For Supabase login, provide an email or an existing username."}, 400

    try:
        response = requests.post(
            f"{supabase_url}/auth/v1/token?grant_type=password",
            json={"email": email, "password": password},
            headers=_supabase_headers(),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        logger.exception("Supabase login request failed")
        return {"message": "Authentication provider unavailable"}, 503

    if response.status_code != 200:
        details = _json_or_text(response)
        logger.warning("Supabase login failed: %s", details)
        return {"message": "Invalid login credentials", "details": details}, response.status_code

    raw_token = response.json()
    access_token = raw_token.get("access_token")
    claims = verify_jwt(access_token) if access_token else None
    if not claims:
        return {"message": "Invalid token received from Supabase"}, 401

    try:
        user, _ = _sync_local_user_from_claims(
            claims,
            {
                "username": identifier,
                "email": email,
                "user_type": payload.get("user_type"),
            },
        )
    except ValueError as exc:
        return {"message": str(exc)}, 409

    _register_device_token(user.id, payload)

    normalized = _normalize_supabase_token_response(raw_token, user)
    if _professional_details_required(user.id, user.user_type):
        normalized["set_professional_details_required"] = True
        normalized["message"] = "Professional details missing. Please provide license and specialization."

    return normalized, 200


def _validated_signup_payload(payload: Dict[str, Any]) -> Tuple[Optional[Dict[str, Any]], Optional[Tuple[Dict[str, str], int]]]:
    email = (payload.get("email") or "").strip().lower()
    confirm_email = (payload.get("confirm_email") or "").strip().lower()
    password = payload.get("password")
    confirm_password = payload.get("confirm_password")
    first_name = (payload.get("first_name") or "").strip()
    last_name = (payload.get("last_name") or "").strip()
    phone_number = (payload.get("phone_number") or "").strip()
    username = (payload.get("username") or "").strip()

    user_type = _normalize_user_type(payload.get("user_type") or "standard")

    if not is_valid_email(email):
        return None, ({"message": "Invalid email address"}, 400)

    if email != confirm_email:
        return None, ({"message": "Emails do not match"}, 400)

    if not password or password != confirm_password:
        return None, ({"message": "Passwords do not match"}, 400)

    required_fields = {
        "email": email,
        "confirm_email": confirm_email,
        "password": password,
        "confirm_password": confirm_password,
        "first_name": first_name,
        "last_name": last_name,
        "phone_number": phone_number,
        "username": username,
    }
    missing = [field for field, value in required_fields.items() if not value]
    if missing:
        return None, ({"message": f"Missing fields: {', '.join(missing)}"}, 400)

    professional_payload = {
        "license_body": payload.get("license_body"),
        "license_number": payload.get("license_number") or payload.get("license"),
        "consent_license_data": payload.get("consent_license_data"),
        "specialization": payload.get("specialization"),
    }

    if user_type == "professional":
        professional_missing = [
            field
            for field in ("license_body", "license_number", "consent_license_data")
            if not professional_payload.get(field)
        ]
        if professional_missing:
            return None, (
                {"message": f"Professional users must provide: {', '.join(professional_missing)}"},
                400,
            )

        if not _truthy(professional_payload["consent_license_data"]):
            return None, ({"message": "You must consent to use and display your license data."}, 400)

    return (
        {
            "email": email,
            "password": password,
            "first_name": first_name,
            "last_name": last_name,
            "phone_number": phone_number,
            "username": username,
            "user_type": user_type,
            **professional_payload,
            "device_token": payload.get("device_token"),
            "platform": payload.get("platform"),
            "device_id": payload.get("device_id"),
        },
        None,
    )


def _signup_with_supabase(payload: Dict[str, Any]):
    supabase_url = _supabase_url()
    if not supabase_url:
        return {"message": "SUPABASE_URL is not configured"}, 500

    signup_payload = {
        "email": payload["email"],
        "password": payload["password"],
        "data": {
            "username": payload["username"],
            "first_name": payload["first_name"],
            "last_name": payload["last_name"],
            "phone_number": payload["phone_number"],
            "user_type": payload["user_type"],
        },
    }

    try:
        response = requests.post(
            f"{supabase_url}/auth/v1/signup",
            json=signup_payload,
            headers=_supabase_headers(),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        logger.exception("Supabase signup request failed")
        return {"message": "Authentication provider unavailable"}, 503

    if response.status_code not in {200, 201}:
        details = _json_or_text(response)
        return {"message": "Failed to create user", "details": details}, response.status_code

    response_json = response.json()
    supabase_user = response_json.get("user") or (response_json.get("session") or {}).get("user")
    subject_id = supabase_user.get("id") if isinstance(supabase_user, dict) else None

    if not subject_id:
        logger.error("Supabase signup response did not include a user id")
        return {"message": "Signup succeeded but user id was not returned by provider"}, 502

    try:
        user, _ = _upsert_local_user(
            subject_id=subject_id,
            email=payload["email"],
            username=payload["username"],
            user_type=payload["user_type"],
            phone_number=payload["phone_number"],
        )
    except ValueError as exc:
        return {"message": str(exc)}, 409

    if payload["user_type"] == "professional":
        _ensure_professional_details(
            user_id=user.id,
            license_body=payload.get("license_body"),
            license_number=payload.get("license_number"),
            consent_license_data=payload.get("consent_license_data"),
            specialization=payload.get("specialization"),
        )

    _register_device_token(user.id, payload)

    return {
        "message": "User created. Check your email to verify your account if verification is enabled.",
        "keycloak_id": user.keycloak_id,
        "user_id": user.id,
        "provider": "supabase",
    }, 201


def _signup_with_keycloak(payload: Dict[str, Any]):
    admin_token = _fetch_keycloak_admin_token()
    if not admin_token:
        return {"message": "Failed to authenticate with Keycloak"}, 500

    create_user_url = f"{_keycloak_admin_base_url()}/users"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json",
    }

    keycloak_payload = {
        "username": payload["username"],
        "email": payload["email"],
        "firstName": payload["first_name"],
        "lastName": payload["last_name"],
        "enabled": True,
        "attributes": {
            "phone_number": payload["phone_number"],
            "user_type": payload["user_type"],
        },
        "credentials": [
            {
                "type": "password",
                "value": payload["password"],
                "temporary": False,
            }
        ],
    }

    if payload["user_type"] == "professional":
        keycloak_payload["attributes"].update(
            {
                "license_body": payload.get("license_body"),
                "license_number": payload.get("license_number"),
                "consent_license_data": str(_truthy(payload.get("consent_license_data"))),
            }
        )

    try:
        response = requests.post(
            create_user_url,
            json=keycloak_payload,
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException:
        logger.exception("Keycloak signup request failed")
        return {"message": "Authentication provider unavailable"}, 503

    if response.status_code == 409:
        return {"message": "User already exists"}, 409

    if response.status_code != 201:
        return {
            "message": "Failed to create user",
            "details": _json_or_text(response),
        }, response.status_code

    location = response.headers.get("Location", "").rstrip("/")
    keycloak_user_id = location.split("/")[-1] if location else None

    if not keycloak_user_id:
        try:
            lookup_response = requests.get(
                create_user_url,
                params={"username": payload["username"], "exact": "true"},
                headers=headers,
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            lookup_response.raise_for_status()
            lookup_payload = lookup_response.json()
            if lookup_payload:
                keycloak_user_id = lookup_payload[0].get("id")
        except requests.RequestException:
            logger.exception("Failed to fetch newly created Keycloak user id")

    if not keycloak_user_id:
        return {"message": "User created, but failed to retrieve provider user id"}, 500

    execute_actions_url = f"{create_user_url}/{keycloak_user_id}/execute-actions-email"
    execute_params = {}
    if current_app.config.get("KEYCLOAK_CLIENT_ID"):
        execute_params["client_id"] = current_app.config["KEYCLOAK_CLIENT_ID"]
    if current_app.config.get("FRONTEND_URI"):
        execute_params["redirect_uri"] = current_app.config["FRONTEND_URI"]

    try:
        execute_response = requests.put(
            execute_actions_url,
            params=execute_params,
            json=["VERIFY_EMAIL"],
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        if execute_response.status_code not in {200, 204}:
            logger.warning("Could not trigger VERIFY_EMAIL action: %s", _json_or_text(execute_response))
    except requests.RequestException:
        logger.exception("Failed to call execute-actions-email for Keycloak signup")

    try:
        user, _ = _upsert_local_user(
            subject_id=keycloak_user_id,
            email=payload["email"],
            username=payload["username"],
            user_type=payload["user_type"],
            phone_number=payload["phone_number"],
        )
    except ValueError as exc:
        return {"message": str(exc)}, 409

    if payload["user_type"] == "professional":
        _ensure_professional_details(
            user_id=user.id,
            license_body=payload.get("license_body"),
            license_number=payload.get("license_number"),
            consent_license_data=payload.get("consent_license_data"),
            specialization=payload.get("specialization"),
        )

    _register_device_token(user.id, payload)

    return {
        "message": "User created in Keycloak and email verification triggered",
        "keycloak_id": user.keycloak_id,
        "user_id": user.id,
        "provider": "keycloak",
    }, 201


@api.route("/sync_user")
class SyncUser(Resource):
    @require_auth()
    @api.doc(security="Bearer")
    def post(self):
        """Create or update the local user row from JWT claims."""
        payload = request.get_json(silent=True) or {}
        claims = _claims_from_request()

        try:
            user, created = _sync_local_user_from_claims(claims, payload)
        except ValueError as exc:
            return {"message": str(exc)}, 409

        response_payload = {
            "message": "User synced" if created else "User already synced",
            "user_id": user.id,
            "keycloak_id": user.keycloak_id,
            "username": user.username,
            "email": user.email,
            "provider": _provider(),
        }
        return response_payload, 201 if created else 200


@api.route("/login")
class Login(Resource):
    from .auth_models import LoginRequest, TokenResponse

    @api.expect(LoginRequest)
    @api.response(200, "Success", TokenResponse)
    def post(self):
        """Exchange credentials for access and refresh tokens."""
        payload = request.get_json(silent=True) or {}
        username = (payload.get("username") or "").strip()
        password = payload.get("password")

        if not username or not password:
            return {"message": "Username and password are required"}, 400

        if _provider() == "supabase":
            return _login_with_supabase(payload, username, password)

        return _login_with_keycloak(payload, username, password)


@api.route("/signup")
class Signup(Resource):
    from .auth_models import SignupRequest, SignupResponse

    @api.expect(SignupRequest)
    @api.response(201, "Success", SignupResponse)
    def post(self):
        """Create a new user in the configured auth provider and sync local DB."""
        raw_payload = request.get_json(silent=True) or {}
        validated_payload, validation_error = _validated_signup_payload(raw_payload)
        if validation_error:
            return validation_error

        if not validated_payload:
            return {"message": "Invalid signup payload"}, 400

        if _provider() == "supabase":
            return _signup_with_supabase(validated_payload)

        return _signup_with_keycloak(validated_payload)


@api.route("/logout")
class Logout(Resource):
    from .auth_models import LogoutRequest

    @require_auth()
    @api.doc(security="Bearer")
    @api.expect(LogoutRequest)
    def post(self):
        """Logout the current user session from the configured provider."""
        payload = request.get_json(silent=True) or {}
        refresh_token = payload.get("refresh_token")

        if _provider() == "supabase":
            supabase_url = _supabase_url()
            if not supabase_url:
                return {"message": "SUPABASE_URL is not configured"}, 500

            access_token = _extract_token_from_header(request.headers.get("Authorization", ""))
            if not access_token:
                return {"message": "Missing Authorization token"}, 401

            try:
                response = requests.post(
                    f"{supabase_url}/auth/v1/logout",
                    headers=_supabase_headers(access_token=access_token),
                    timeout=REQUEST_TIMEOUT_SECONDS,
                )
            except requests.RequestException:
                logger.exception("Supabase logout request failed")
                return {"message": "Authentication provider unavailable"}, 503

            if response.status_code in {200, 204}:
                return {"message": "Logged out successfully"}, 200

            return {
                "message": "Logout failed",
                "details": _json_or_text(response),
            }, response.status_code

        if not refresh_token:
            return {"message": "Refresh token is required"}, 400

        keycloak_logout_url = f"{_keycloak_realm_base_url()}/protocol/openid-connect/logout"
        request_payload = {
            "client_id": current_app.config["KEYCLOAK_CLIENT_ID"],
            "client_secret": current_app.config["KEYCLOAK_CLIENT_SECRET"],
            "refresh_token": refresh_token,
        }

        try:
            response = requests.post(
                keycloak_logout_url,
                data=request_payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
        except requests.RequestException:
            logger.exception("Keycloak logout request failed")
            return {"message": "Authentication provider unavailable"}, 503

        if response.status_code in {200, 204}:
            return {"message": "Logged out successfully"}, 200

        return {
            "message": "Logout failed",
            "details": _json_or_text(response),
        }, response.status_code


@api.route("/refresh_token")
class RefreshToken(Resource):
    from .auth_models import RefreshTokenRequest, TokenResponse

    @api.expect(RefreshTokenRequest)
    @api.response(200, "Success", TokenResponse)
    def post(self):
        """Refresh access token using refresh token."""
        payload = request.get_json(silent=True) or {}
        refresh_token = payload.get("refresh_token")

        if not refresh_token:
            return {"message": "Missing refresh token"}, 400

        if _provider() == "supabase":
            supabase_url = _supabase_url()
            if not supabase_url:
                return {"message": "SUPABASE_URL is not configured"}, 500

            try:
                response = requests.post(
                    f"{supabase_url}/auth/v1/token?grant_type=refresh_token",
                    json={"refresh_token": refresh_token},
                    headers=_supabase_headers(),
                    timeout=REQUEST_TIMEOUT_SECONDS,
                )
            except requests.RequestException:
                logger.exception("Supabase token refresh request failed")
                return {"message": "Authentication provider unavailable"}, 503

            if response.status_code != 200:
                return {
                    "message": "Failed to refresh token",
                    "details": _json_or_text(response),
                }, response.status_code

            refreshed = response.json()
            return {
                "access_token": refreshed.get("access_token"),
                "token_type": refreshed.get("token_type", "bearer"),
                "expires_in": refreshed.get("expires_in"),
                "refresh_expires_in": refreshed.get("expires_in"),
                "refresh_token": refreshed.get("refresh_token"),
                "provider": "supabase",
            }, 200

        keycloak_url = f"{_keycloak_realm_base_url()}/protocol/openid-connect/token"
        request_payload = {
            "grant_type": "refresh_token",
            "client_id": current_app.config["KEYCLOAK_CLIENT_ID"],
            "client_secret": current_app.config["KEYCLOAK_CLIENT_SECRET"],
            "refresh_token": refresh_token,
        }

        try:
            response = requests.post(
                keycloak_url,
                data=request_payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
        except requests.RequestException:
            logger.exception("Keycloak token refresh request failed")
            return {"message": "Authentication provider unavailable"}, 503

        if response.status_code == 200:
            refreshed = response.json()
            refreshed["provider"] = "keycloak"
            return refreshed, 200

        return {
            "message": "Failed to refresh token",
            "details": _json_or_text(response),
        }, response.status_code


@api.route("/set_user_type")
class SetUserType(Resource):
    from .auth_models import SetUserTypeRequest

    @require_auth()
    @api.doc(security="Bearer")
    @api.expect(SetUserTypeRequest)
    def post(self):
        """Set user type (professional or standard) for the authenticated user."""
        from app.models import User, db

        payload = request.get_json(silent=True) or {}
        requested_user_type = _normalize_user_type(payload.get("user_type"))
        if requested_user_type not in {"professional", "standard"}:
            return {"message": "Invalid user type. Choose 'professional' or 'standard'."}, 400

        request_user = getattr(request, "user", {}) or {}
        subject_id = request_user.get("keycloak_id")
        user = User.query.filter_by(keycloak_id=subject_id).first()

        if not user:
            claims = _claims_from_request()
            try:
                user, _ = _sync_local_user_from_claims(claims, payload)
            except ValueError:
                return {"message": "User not found"}, 404

        roles = [str(role).lower() for role in request_user.get("roles", [])]
        if _provider() == "keycloak" and ("professional" in roles or "standard" in roles):
            return {"message": "User type is managed by Keycloak. Manual change not allowed."}, 400

        user.user_type = requested_user_type
        db.session.commit()

        if requested_user_type == "professional":
            _ensure_professional_details(
                user_id=user.id,
                license_body=payload.get("license_body"),
                license_number=payload.get("license_number") or payload.get("license"),
                consent_license_data=payload.get("consent_license_data", True),
                specialization=payload.get("specialization"),
            )

        return {"message": f"User type set to {requested_user_type}"}, 200


@api.route("/change_password")
class ChangePassword(Resource):
    from .auth_models import ChangePasswordRequest

    @require_auth()
    @api.doc(security="Bearer")
    @api.expect(ChangePasswordRequest)
    def post(self):
        """Change password in the configured auth provider."""
        payload = request.get_json(silent=True) or {}
        new_password = payload.get("new_password")

        if not new_password:
            return {"message": "New password is required"}, 400

        if _provider() == "supabase":
            supabase_url = _supabase_url()
            if not supabase_url:
                return {"message": "SUPABASE_URL is not configured"}, 500

            access_token = _extract_token_from_header(request.headers.get("Authorization", ""))
            if not access_token:
                return {"message": "Missing Authorization token"}, 401

            try:
                response = requests.put(
                    f"{supabase_url}/auth/v1/user",
                    json={"password": new_password},
                    headers=_supabase_headers(access_token=access_token),
                    timeout=REQUEST_TIMEOUT_SECONDS,
                )
            except requests.RequestException:
                logger.exception("Supabase password update request failed")
                return {"message": "Authentication provider unavailable"}, 503

            if response.status_code == 200:
                return {"message": "Password changed successfully"}, 200

            return {
                "message": "Failed to change password",
                "details": _json_or_text(response),
            }, response.status_code

        admin_token = _fetch_keycloak_admin_token()
        if not admin_token:
            return {"message": "Failed to authenticate with Keycloak"}, 500

        request_user = getattr(request, "user", {}) or {}
        user_id = request_user.get("keycloak_id")
        keycloak_admin_url = f"{_keycloak_admin_base_url()}/users/{user_id}/reset-password"
        keycloak_payload = {
            "type": "password",
            "value": new_password,
            "temporary": False,
        }

        try:
            response = requests.put(
                keycloak_admin_url,
                json=keycloak_payload,
                headers={"Authorization": f"Bearer {admin_token}"},
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
        except requests.RequestException:
            logger.exception("Keycloak password update request failed")
            return {"message": "Authentication provider unavailable"}, 503

        if response.status_code == 204:
            return {"message": "Password changed successfully"}, 200

        return {
            "message": "Failed to change password",
            "details": _json_or_text(response),
        }, response.status_code


@api.route("/reset_password")
class ResetPassword(Resource):
    from .auth_models import ResetPasswordRequest

    @api.expect(ResetPasswordRequest)
    def post(self):
        """Trigger password reset flow in the configured auth provider."""
        payload = request.get_json(silent=True) or {}
        email = (payload.get("email") or "").strip().lower()

        if not email:
            return {"message": "Email is required"}, 400

        if _provider() == "supabase":
            supabase_url = _supabase_url()
            if not supabase_url:
                return {"message": "SUPABASE_URL is not configured"}, 500

            recover_payload = {"email": email}
            redirect_to = current_app.config.get("FRONTEND_URI") or os.getenv("FRONTEND_URI")
            if redirect_to:
                recover_payload["redirect_to"] = redirect_to

            try:
                response = requests.post(
                    f"{supabase_url}/auth/v1/recover",
                    json=recover_payload,
                    headers=_supabase_headers(),
                    timeout=REQUEST_TIMEOUT_SECONDS,
                )
            except requests.RequestException:
                logger.exception("Supabase recover request failed")
                return {"message": "Authentication provider unavailable"}, 503

            if response.status_code in {200, 202}:
                return {"message": "Password reset email sent"}, 200

            return {
                "message": "Failed to send password reset email",
                "details": _json_or_text(response),
            }, response.status_code

        admin_token = _fetch_keycloak_admin_token()
        if not admin_token:
            return {"message": "Failed to authenticate with Keycloak"}, 500

        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}

        try:
            users_response = requests.get(
                f"{_keycloak_admin_base_url()}/users",
                params={"email": email, "exact": "true"},
                headers=headers,
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
        except requests.RequestException:
            logger.exception("Keycloak user lookup failed for reset_password")
            return {"message": "Authentication provider unavailable"}, 503

        if users_response.status_code != 200:
            return {
                "message": "Failed to send password reset email",
                "details": _json_or_text(users_response),
            }, users_response.status_code

        users = users_response.json() or []
        if not users:
            return {"message": "User not found"}, 404

        keycloak_user_id = users[0].get("id")
        execute_actions_url = f"{_keycloak_admin_base_url()}/users/{keycloak_user_id}/execute-actions-email"
        execute_params = {}
        if current_app.config.get("KEYCLOAK_CLIENT_ID"):
            execute_params["client_id"] = current_app.config["KEYCLOAK_CLIENT_ID"]
        if current_app.config.get("FRONTEND_URI"):
            execute_params["redirect_uri"] = current_app.config["FRONTEND_URI"]

        try:
            execute_response = requests.put(
                execute_actions_url,
                params=execute_params,
                json=["UPDATE_PASSWORD"],
                headers=headers,
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
        except requests.RequestException:
            logger.exception("Keycloak execute-actions-email failed for reset_password")
            return {"message": "Authentication provider unavailable"}, 503

        if execute_response.status_code in {200, 204}:
            return {"message": "Password reset email sent"}, 200

        return {
            "message": "Failed to send password reset email",
            "details": _json_or_text(execute_response),
        }, execute_response.status_code


@api.route("/delete_account")
class DeleteAccount(Resource):
    from .auth_models import DeleteAccountRequest

    @require_auth()
    @api.doc(security="Bearer")
    @api.expect(DeleteAccountRequest)
    def delete(self):
        """Delete user account from provider and local DB."""
        from app.models import User, db

        payload = request.get_json(silent=True) or {}
        if not _truthy(payload.get("confirmation")):
            return {"message": "Confirmation is required to delete account"}, 400

        request_user = getattr(request, "user", {}) or {}
        subject_id = request_user.get("keycloak_id")
        user = User.query.filter_by(keycloak_id=subject_id).first()

        if _provider() == "supabase":
            supabase_url = _supabase_url()
            if not supabase_url:
                return {"message": "SUPABASE_URL is not configured"}, 500

            service_key = _supabase_service_key()
            if not service_key:
                return {"message": "SUPABASE_SERVICE_ROLE_KEY is required for account deletion"}, 500

            try:
                response = requests.delete(
                    f"{supabase_url}/auth/v1/admin/users/{subject_id}",
                    headers=_supabase_headers(use_service=True),
                    timeout=REQUEST_TIMEOUT_SECONDS,
                )
            except requests.RequestException:
                logger.exception("Supabase delete user request failed")
                return {"message": "Authentication provider unavailable"}, 503

            if response.status_code not in {200, 204, 404}:
                return {
                    "message": "Failed to delete account",
                    "details": _json_or_text(response),
                }, response.status_code

        else:
            admin_token = _fetch_keycloak_admin_token()
            if not admin_token:
                return {"message": "Failed to authenticate with Keycloak"}, 500

            try:
                response = requests.delete(
                    f"{_keycloak_admin_base_url()}/users/{subject_id}",
                    headers={"Authorization": f"Bearer {admin_token}"},
                    timeout=REQUEST_TIMEOUT_SECONDS,
                )
            except requests.RequestException:
                logger.exception("Keycloak delete user request failed")
                return {"message": "Authentication provider unavailable"}, 503

            if response.status_code not in {200, 204, 404}:
                return {
                    "message": "Failed to delete account",
                    "details": _json_or_text(response),
                }, response.status_code

        if user:
            db.session.delete(user)
            db.session.commit()

        return {"message": "Account deleted successfully"}, 200
