#!/usr/bin/env python3
"""Keycloak MFA rollout helper for the YesLove realm (stages 1 and 2 of the MFA plan).

Every command is a dry run unless you pass --apply, and every change is idempotent.

  status              Show security settings and who in the staff roles has an authenticator.
  harden              Stage 1: brute-force protection, password policy, login and admin events.
  require-enrolment   Ask staff without an authenticator to set one up at their next browser login.
  enforce             Stage 2: refuse password logins from staff roles unless they give a code.
  undo-enforce        Put the original password-grant flow back.
  fix-account-console Point the account console at this realm. Members and staff set up their
                      authenticator app there; an export made from the master realm left its
                      redirect list pointing at /realms/master, so it fails with
                      "Invalid parameter: redirect_uri".

Connection comes from the environment, so no secret is ever written to a file:
  KEYCLOAK_URL (default http://localhost:8099), KEYCLOAK_REALM (default YesLove_Auth),
  KEYCLOAK_ADMIN_USER, KEYCLOAK_ADMIN_PASS.

Run `enforce` only after staff have enrolled (see `status`): anyone in a staff role who has
not set up an authenticator will be unable to log in until they do.
"""
import argparse
import json
import os
import sys
from urllib.parse import quote

import requests

URL = os.environ.get("KEYCLOAK_URL", "http://localhost:8099").rstrip("/")
REALM = os.environ.get("KEYCLOAK_REALM", "YesLove_Auth")
# Admins only for now. "professional" is a role members can sign up for with a licence, so
# enforcing it would put every outside professional behind a code; they come in stage 4.
STAFF_ROLES = ["admin"]
ENFORCED_FLOW = "staff-mfa-direct-grant"
ORIGINAL_FLOW = "direct grant"

HARDENING = {
    # Lock an account after 5 wrong passwords, with a growing wait (1 minute steps up to 15).
    "bruteForceProtected": True,
    "permanentLockout": False,
    "failureFactor": 5,
    "waitIncrementSeconds": 60,
    "maxFailureWaitSeconds": 900,
    "maxDeltaTimeSeconds": 43200,
    "quickLoginCheckMilliSeconds": 1000,
    "minimumQuickLoginWaitSeconds": 60,
    # NCSC guidance favours length over complexity rules.
    "passwordPolicy": "length(12) and notUsername(undefined) and notEmail(undefined)",
    # Audit trail: sign-in events kept 90 days, and who changed what in the admin console.
    "eventsEnabled": True,
    "eventsExpiration": 7776000,
    "adminEventsEnabled": True,
    "adminEventsDetailsEnabled": False,  # details can contain secrets, so record actions only
    "enabledEventTypes": [
        "LOGIN", "LOGIN_ERROR", "LOGOUT", "REGISTER", "REGISTER_ERROR", "UPDATE_PASSWORD",
        "UPDATE_PASSWORD_ERROR", "UPDATE_TOTP", "REMOVE_TOTP", "RESET_PASSWORD",
        "RESET_PASSWORD_ERROR", "SEND_VERIFY_EMAIL", "VERIFY_EMAIL", "DELETE_ACCOUNT",
        "USER_DISABLED_BY_PERMANENT_LOCKOUT", "USER_DISABLED_BY_TEMPORARY_LOCKOUT",
        "REMOVE_CREDENTIAL", "UPDATE_CREDENTIAL", "CODE_TO_TOKEN_ERROR", "REFRESH_TOKEN_ERROR",
    ],
}


def session():
    user, password = os.environ.get("KEYCLOAK_ADMIN_USER"), os.environ.get("KEYCLOAK_ADMIN_PASS")
    if not user or not password:
        sys.exit("Set KEYCLOAK_ADMIN_USER and KEYCLOAK_ADMIN_PASS in the environment.")
    r = requests.post(
        f"{URL}/realms/master/protocol/openid-connect/token",
        data={"grant_type": "password", "client_id": "admin-cli", "username": user, "password": password},
        timeout=15,
    )
    r.raise_for_status()
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {r.json()['access_token']}", "Content-Type": "application/json"})
    s.base = f"{URL}/admin/realms/{REALM}"
    return s


def get(s, path, **params):
    r = s.get(f"{s.base}{path}", params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def staff_users(s):
    """Users in a staff role, with whether they have an authenticator app."""
    seen = {}
    for role in STAFF_ROLES:
        for u in get(s, f"/roles/{quote(role)}/users", max=1000):
            seen.setdefault(u["id"], {"user": u, "roles": set()})["roles"].add(role)
    for entry in seen.values():
        creds = get(s, f"/users/{entry['user']['id']}/credentials")
        entry["has_otp"] = any(c.get("type") == "otp" for c in creds)
    return list(seen.values())


def cmd_status(s, args):
    realm = get(s, "")
    print(f"Realm {REALM} on {URL}")
    for key in HARDENING:
        if key == "enabledEventTypes":
            continue
        print(f"  {key}: {realm.get(key)}  (target {HARDENING[key]})")
    print(f"  directGrantFlow: {realm.get('directGrantFlow')}")
    users = staff_users(s)
    print(f"\nStaff accounts ({', '.join(STAFF_ROLES)}): {len(users)}")
    for e in sorted(users, key=lambda e: e["user"]["username"]):
        print(f"  {e['user']['username']:<24} {','.join(sorted(e['roles'])):<24} authenticator: {'yes' if e['has_otp'] else 'NO'}")
    missing = [e for e in users if not e["has_otp"]]
    print(f"\n{len(missing)} staff account(s) without an authenticator." +
          ("  Do not run `enforce` yet." if missing else "  Safe to run `enforce`."))


def cmd_harden(s, args):
    realm = get(s, "")

    def differs(key, wanted):
        have = realm.get(key)
        if isinstance(wanted, list):  # Keycloak stores event types in its own order
            return set(have or []) != set(wanted)
        return have != wanted

    changes = {k: v for k, v in HARDENING.items() if differs(k, v)}
    if not changes:
        print("Realm already matches the stage 1 settings.")
        return
    for k, v in changes.items():
        shown = "<event list>" if k == "enabledEventTypes" else v
        print(f"  {k}: {'<event list>' if k == 'enabledEventTypes' else realm.get(k)} -> {shown}")
    if not args.apply:
        print("\nDry run. Re-run with --apply to make these changes.")
        return
    r = s.put(s.base, data=json.dumps({**realm, **changes}), timeout=30)
    r.raise_for_status()
    print("\nApplied.")


def cmd_require_enrolment(s, args):
    todo = [e for e in staff_users(s) if not e["has_otp"]]
    if not todo:
        print("Every staff account already has an authenticator.")
        return
    for e in todo:
        u = e["user"]
        actions = set(u.get("requiredActions") or [])
        if "CONFIGURE_TOTP" in actions:
            print(f"  {u['username']}: already asked to enrol")
            continue
        print(f"  {u['username']}: will be asked to set up an authenticator at next browser login")
        if args.apply:
            full = get(s, f"/users/{u['id']}")
            full["requiredActions"] = sorted(actions | {"CONFIGURE_TOTP"})
            s.put(f"{s.base}/users/{u['id']}", data=json.dumps(full), timeout=30).raise_for_status()
    print("" if args.apply else "\nDry run. Re-run with --apply to make these changes.")
    print("Enrolment happens in a browser: " + f"{URL}/realms/{REALM}/account  (Signing in, Authenticator application).")


def _flow(s, alias):
    return next((f for f in get(s, "/authentication/flows") if f["alias"] == alias), None)


def cmd_enforce(s, args):
    users = staff_users(s)
    missing = [e["user"]["username"] for e in users if not e["has_otp"]]
    if missing:
        print(f"WARNING: {len(missing)} staff account(s) have no authenticator and would be locked out: {', '.join(missing)}")
        if args.apply and not args.force:
            sys.exit("Refusing to enforce. Have them enrol first, or pass --force.")
    if _flow(s, ENFORCED_FLOW):
        print(f"Flow '{ENFORCED_FLOW}' already exists.")
    else:
        print(f"Would copy '{ORIGINAL_FLOW}' to '{ENFORCED_FLOW}' and change it so that:")
        print(f"  - members in the roles {STAFF_ROLES} must always give a one-time code (an account with no authenticator is refused)")
        print("  - everyone else is asked for a code only if they have set up an authenticator, as before")
        print("  - a code is asked for once, even for someone in more than one staff role")
    realm = get(s, "")
    print(f"Would bind '{ENFORCED_FLOW}' as the realm's direct grant flow (now '{realm.get('directGrantFlow')}').")
    if not args.apply:
        print("\nDry run. Re-run with --apply to make these changes.")
        return

    # Build the flow step by step, creating only what is missing, so an interrupted run can be
    # repeated. (If a previous attempt built the flow differently, delete the
    # 'staff-mfa-direct-grant' flow in the admin console first.)
    if not _flow(s, ENFORCED_FLOW):
        s.post(f"{s.base}/authentication/flows/{quote(ORIGINAL_FLOW)}/copy",
               data=json.dumps({"newName": ENFORCED_FLOW}), timeout=30).raise_for_status()
    flow_path = quote(ENFORCED_FLOW)

    def executions(path):
        return get(s, f"/authentication/flows/{path}/executions")

    def config_of(ex):
        return get(s, f"/authentication/config/{ex['authenticationConfig']}").get("config", {}) if ex.get("authenticationConfig") else {}

    def ensure_execution(path, provider, wanted_config=None):
        """Find or create a step of this type with this configuration, and make it REQUIRED."""
        def matches(e):
            return e.get("providerId") == provider and (wanted_config is None or
                   all(config_of(e).get(k) == v for k, v in wanted_config.items()))
        ex = next((e for e in executions(path) if matches(e)), None)
        if ex is None:
            s.post(f"{s.base}/authentication/flows/{path}/executions/execution",
                   data=json.dumps({"provider": provider}), timeout=30).raise_for_status()
            ex = next(e for e in executions(path) if e.get("providerId") == provider and not e.get("authenticationConfig"))
            if wanted_config:
                s.post(f"{s.base}/authentication/executions/{ex['id']}/config",
                       data=json.dumps({"alias": f"{path} {provider} {len(executions(path))}", "config": wanted_config}),
                       timeout=30).raise_for_status()
        if ex.get("requirement") != "REQUIRED":
            ex["requirement"] = "REQUIRED"
            s.put(f"{s.base}/authentication/flows/{path}/executions", data=json.dumps(ex), timeout=30).raise_for_status()

    def role_condition(role, negate):
        return {"condUserRole": role, "negate": "true" if negate else "false"}

    # (a) The existing "ask for a code if you have an authenticator" step now applies to
    #     non-staff only, so staff are never asked twice.
    default_sub = next(e for e in executions(flow_path) if e.get("displayName", "").endswith("Direct Grant - Conditional OTP"))
    default_path = quote(default_sub["displayName"])
    for role in STAFF_ROLES:
        ensure_execution(default_path, "conditional-user-role", role_condition(role, negate=True))

    # (b) Staff roles must always give a code. The Nth role skips people already covered by
    #     an earlier staff role.
    for i, role in enumerate(STAFF_ROLES):
        sub = f"Staff MFA - {role}"
        sub_path = quote(sub)
        if not any(e.get("displayName") == sub for e in executions(flow_path)):
            s.post(f"{s.base}/authentication/flows/{flow_path}/executions/flow",
                   data=json.dumps({"alias": sub, "type": "basic-flow", "provider": "registration-page-form",
                                    "description": f"{role} accounts must give a one-time code"}),
                   timeout=30).raise_for_status()
        sub_exec = next(e for e in executions(flow_path) if e.get("displayName") == sub)
        if sub_exec.get("requirement") != "CONDITIONAL":
            sub_exec["requirement"] = "CONDITIONAL"
            s.put(f"{s.base}/authentication/flows/{flow_path}/executions", data=json.dumps(sub_exec), timeout=30).raise_for_status()
        ensure_execution(sub_path, "conditional-user-role", role_condition(role, negate=False))
        for earlier in STAFF_ROLES[:i]:
            ensure_execution(sub_path, "conditional-user-role", role_condition(earlier, negate=True))
        ensure_execution(sub_path, "direct-grant-validate-otp")

    s.put(s.base, data=json.dumps({**realm, "directGrantFlow": ENFORCED_FLOW}), timeout=30).raise_for_status()
    print("\nApplied. Staff roles now need a one-time code for password logins.")


def cmd_undo_enforce(s, args):
    realm = get(s, "")
    print(f"Would bind '{ORIGINAL_FLOW}' back as the direct grant flow (now '{realm.get('directGrantFlow')}').")
    if not args.apply:
        print("\nDry run. Re-run with --apply to make these changes.")
        return
    s.put(s.base, data=json.dumps({**realm, "directGrantFlow": ORIGINAL_FLOW}), timeout=30).raise_for_status()
    print("\nApplied.")


def cmd_fix_account_console(s, args):
    """The account console (where members set up an authenticator) must redirect back into this realm."""
    wanted_base = f"/realms/{REALM}/account/"
    wanted_redirects = [f"/realms/{REALM}/account/*"]
    changed = False
    for client_id in ("account-console", "account"):
        r = s.get(f"{s.base}/clients", params={"clientId": client_id}, timeout=30)
        r.raise_for_status()
        client = next((c for c in r.json() if c["clientId"] == client_id), None)
        if client is None:
            print(f"{client_id}: not found, nothing to do")
            continue
        redirects = client.get("redirectUris") or []
        # Keep any other entries (including a wildcard someone added on purpose); only replace
        # the master-realm path, which can never be right here.
        fixed = [u for u in redirects if "/realms/master/" not in u]
        for u in wanted_redirects:
            if u not in fixed:
                fixed.append(u)
        if client.get("baseUrl") == wanted_base and fixed == redirects:
            print(f"{client_id}: already correct")
            continue
        print(f"{client_id}: baseUrl {client.get('baseUrl')!r} -> {wanted_base!r}; redirectUris {redirects} -> {fixed}")
        if args.apply:
            client.update({"baseUrl": wanted_base, "redirectUris": fixed})
            s.put(f"{s.base}/clients/{client['id']}", data=json.dumps(client), timeout=30).raise_for_status()
        changed = True
    if changed and not args.apply:
        print("\nDry run. Re-run with --apply to make these changes.")
    elif changed:
        print("\nApplied.")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("command", choices=["status", "harden", "require-enrolment", "enforce", "undo-enforce", "fix-account-console"])
    p.add_argument("--apply", action="store_true", help="make the change (default is a dry run)")
    p.add_argument("--force", action="store_true", help="enforce even if some staff have no authenticator")
    args = p.parse_args()
    s = session()
    {"status": cmd_status, "harden": cmd_harden, "require-enrolment": cmd_require_enrolment,
     "enforce": cmd_enforce, "undo-enforce": cmd_undo_enforce,
     "fix-account-console": cmd_fix_account_console}[args.command](s, args)


if __name__ == "__main__":
    main()
