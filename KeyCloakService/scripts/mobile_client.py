#!/usr/bin/env python3
"""Keycloak client for the mobile app's browser sign-in (stage 3 of the MFA plan).

  status   Show the mobile client and how the existing `yeslove` client is set up.
  create   Create (or bring back into line) the public `yeslove-mobile` client.

Every command is a dry run unless you pass --apply, and `create` is idempotent.

The mobile client is a public client: authorization code flow with PKCE (S256) only, no secret,
no implicit flow, no direct password grant and no service account. It does NOT touch the
existing `yeslove` client, so the current app keeps working while the new build is rolled out.

Connection comes from the environment, so no secret is written to a file:
  KEYCLOAK_URL (default http://localhost:8099), KEYCLOAK_REALM (default YesLove_Auth),
  KEYCLOAK_ADMIN_USER, KEYCLOAK_ADMIN_PASS.
"""
import argparse
import json
import os
import sys

import requests

URL = os.environ.get("KEYCLOAK_URL", "http://localhost:8099").rstrip("/")
REALM = os.environ.get("KEYCLOAK_REALM", "YesLove_Auth")
CLIENT_ID = os.environ.get("MOBILE_CLIENT_ID", "yeslove-mobile")
LEGACY_CLIENT_ID = "yeslove"

# The app's link scheme is yeslove:// (frontendmobileapp/app.json). Keycloak matches these exactly.
REDIRECT_URIS = ["yeslove://auth/callback"]
LOGOUT_REDIRECT_URIS = ["yeslove://auth/logout"]

DESIRED = {
    "clientId": CLIENT_ID,
    "name": "YesLove mobile app",
    "protocol": "openid-connect",
    "enabled": True,
    "publicClient": True,
    "standardFlowEnabled": True,
    "implicitFlowEnabled": False,
    "directAccessGrantsEnabled": False,
    "serviceAccountsEnabled": False,
    "redirectUris": REDIRECT_URIS,
    "webOrigins": [],
    "attributes": {
        "pkce.code.challenge.method": "S256",
        "post.logout.redirect.uris": "##".join(LOGOUT_REDIRECT_URIS),
    },
}


def session():
    user, password = os.environ.get("KEYCLOAK_ADMIN_USER"), os.environ.get("KEYCLOAK_ADMIN_PASS")
    if not user or not password:
        sys.exit("Set KEYCLOAK_ADMIN_USER and KEYCLOAK_ADMIN_PASS in the environment.")
    r = requests.post(f"{URL}/realms/master/protocol/openid-connect/token",
                      data={"grant_type": "password", "client_id": "admin-cli", "username": user, "password": password},
                      timeout=15)
    r.raise_for_status()
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {r.json()['access_token']}", "Content-Type": "application/json"})
    s.base = f"{URL}/admin/realms/{REALM}"
    return s


def find_client(s, client_id):
    r = s.get(f"{s.base}/clients", params={"clientId": client_id}, timeout=30)
    r.raise_for_status()
    return next((c for c in r.json() if c["clientId"] == client_id), None)


def differences(client):
    """What differs from DESIRED, as {field: (current, wanted)}."""
    out = {}
    for key, wanted in DESIRED.items():
        if key == "attributes":
            for attr, value in wanted.items():
                current = (client.get("attributes") or {}).get(attr)
                if current != value:
                    out[f"attributes.{attr}"] = (current, value)
        elif client.get(key) != wanted:
            out[key] = (client.get(key), wanted)
    return out


def cmd_status(s, args):
    mobile = find_client(s, CLIENT_ID)
    print(f"Mobile client '{CLIENT_ID}': " + ("missing" if not mobile else "present"))
    if mobile:
        for field, (cur, want) in differences(mobile).items():
            print(f"  differs: {field}: {cur!r} (wanted {want!r})")
        if not differences(mobile):
            print("  matches the intended settings")
    legacy = find_client(s, LEGACY_CLIENT_ID)
    if legacy:
        print(f"\nExisting client '{LEGACY_CLIENT_ID}' (left unchanged by this script):")
        for key in ("publicClient", "standardFlowEnabled", "implicitFlowEnabled", "directAccessGrantsEnabled",
                    "serviceAccountsEnabled", "redirectUris", "webOrigins"):
            print(f"  {key}: {legacy.get(key)!r}")
        notes = []
        if "*" in (legacy.get("redirectUris") or []):
            notes.append("redirect list is a wildcard")
        if legacy.get("implicitFlowEnabled"):
            notes.append("implicit flow is on")
        if notes:
            print("  To tighten once nothing depends on it: " + "; ".join(notes) + ".")


def cmd_create(s, args):
    mobile = find_client(s, CLIENT_ID)
    if mobile is None:
        print(f"Would create client '{CLIENT_ID}': public, authorization code + PKCE S256, redirect {REDIRECT_URIS}")
        if args.apply:
            r = s.post(f"{s.base}/clients", data=json.dumps(DESIRED), timeout=30)
            r.raise_for_status()
            print("Created.")
        else:
            print("\nDry run. Pass --apply to make the change.")
        return
    diffs = differences(mobile)
    if not diffs:
        print(f"Client '{CLIENT_ID}' already matches the intended settings.")
        return
    for field, (cur, want) in diffs.items():
        print(f"Would change {field}: {cur!r} -> {want!r}")
    if args.apply:
        updated = {**mobile, **{k: v for k, v in DESIRED.items() if k != "attributes"}}
        updated["attributes"] = {**(mobile.get("attributes") or {}), **DESIRED["attributes"]}
        r = s.put(f"{s.base}/clients/{mobile['id']}", data=json.dumps(updated), timeout=30)
        r.raise_for_status()
        print("Updated.")
    else:
        print("\nDry run. Pass --apply to make the change.")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("command", choices=["status", "create"])
    p.add_argument("--apply", action="store_true", help="make the change (default is a dry run)")
    args = p.parse_args()
    s = session()
    {"status": cmd_status, "create": cmd_create}[args.command](s, args)


if __name__ == "__main__":
    main()
