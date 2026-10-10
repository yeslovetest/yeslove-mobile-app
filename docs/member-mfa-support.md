# Member two-step verification: support guide (MFA stage 4)

How members protect their accounts, and what support does when one is locked out. Admins follow the separate admin recovery steps in the Compliance Pack. Nothing here is switched on for a member unless they choose it: members are offered two-step verification, not forced into it.

## What members see

In a browser sign-in build, **Settings > General** shows a **Protect your account** card. It explains two-step verification in plain words and opens Keycloak's account page on **Signing in**, where the member sets up an authenticator app. Signing in afterwards asks for the 6-digit code on Keycloak's own page.

## Before any of this works: fix the account console

The realm was exported from the master realm, so the account console's redirect list pointed at `/realms/master/account/*`. On production (and locally) the account page therefore fails with "Invalid parameter: redirect_uri", which blocks members and staff from setting up an authenticator there. A person with Keycloak admin access runs, against production:

```
python3 KeyCloakService/scripts/mfa.py fix-account-console           # dry run
python3 KeyCloakService/scripts/mfa.py fix-account-console --apply
```

Then open `https://auth.yeslove.co.uk/realms/YesLove_Auth/account/` in a browser and check it shows the sign-in page, not the error. The account console asks for the password again even right after a sign-in in the app; that is expected.

## When a member is locked out (lost or replaced phone)

1. **Check it is them** before changing anything. Ask for something only the account holder would know and that you can verify (for example, the email on the account plus a recent post or the date they joined), and reply only to the email address on the account. Never accept a code, password or screenshot of an authenticator app.
2. **If they saved recovery codes,** they can use one on the Keycloak sign-in page instead of the 6-digit code. No reset is needed, but they should set up a new authenticator straight after.
3. **Otherwise reset it:** in the Keycloak admin console, open YesLove_Auth > Users > the member > Credentials, delete their one-time code entry, then add the required action "Configure OTP". At their next sign-in Keycloak makes them set up a new authenticator.
4. **Record** who asked, who checked, how, and when, in [log location]. Do not record codes.
5. **Tell the member** by email that the reset happened, and that if they did not ask for it they should change their password and write back at once.

## Passkeys (not started)

Passkeys need three things outside the app code:
- the relying-party ID set to the sign-in domain in Keycloak's WebAuthn passwordless policy;
- `apple-app-site-association` and `assetlinks.json` served from that domain, listing the app's identifiers (bundle `uk.co.yeslove.app`, with its team ID and signing certificate fingerprint);
- associated-domains entries in the app config, then a new native build.

Check first that the production Keycloak has the passkeys and recovery-codes features on.

## Open facts

- Support address members write to: [email] (set `EXPO_PUBLIC_SUPPORT_EMAIL` in the build so the app names it).
- Who may reset a member's authenticator, and where the log lives: [names, location]
- Production Keycloak version and whether recovery codes and passkeys are on: [check]
