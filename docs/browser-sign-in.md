# Browser sign-in (MFA stage 3)

Members sign in on Keycloak's own page in the system browser sheet, using authorization code with PKCE. The password, and any one-time code, goes to Keycloak and never through our API. The app only holds the resulting tokens.

It is **off by default**. A build with `EXPO_PUBLIC_BROWSER_SIGN_IN` unset keeps the password form and `/api/auth/login`, so nothing changes until the setting is turned on.

## Moving parts

| Part | What it does |
| --- | --- |
| Keycloak client `yeslove-mobile` | Public client, authorization code only, PKCE S256 required, no secret, no implicit flow, no password grant, redirect `yeslove://auth/callback`. Create it with `KeyCloakService/scripts/mobile_client.py create --apply` (dry run without `--apply`). |
| `frontendmobileapp/app/services/oidc.ts` | Opens the browser sheet, exchanges the code, refreshes tokens straight with Keycloak, and ends the session on sign-out. Remembers whether this session is a browser or a password sign-in. |
| `POST /api/auth/session` | After sign-in, creates or links the local account from the verified token and returns the identity. The password never reaches the API, so `/login` cannot do this for browser sign-ins. |
| `verify_jwt` | Now accepts tokens only from our own clients (`ALLOWED_TOKEN_CLIENTS`, default `yeslove` and `yeslove-mobile`). |

Refresh tokens only work with the client that issued them, so a password sign-in refreshes through the API and a browser sign-in refreshes directly with Keycloak.

## Turning it on

1. A person with Keycloak admin access runs `mobile_client.py create --apply` against production.
2. Deploy the API (it already accepts the new client and has `/api/auth/session`).
3. Build the app with `EXPO_PUBLIC_BROWSER_SIGN_IN=true` and `EXPO_PUBLIC_KEYCLOAK_URL` set to the production sign-in address.
4. Test on a real iPhone and an Android phone: sign up, verify email, sign in, close and reopen the app (refresh), sign out, and a password reset from Keycloak's page.

## Known limits

- **Settings:** "Change password" becomes "Password and security" and opens Keycloak's account page, because the app never holds the password.
- **Old builds** keep working with the password form until the old path is switched off. That needs a minimum-version check first.
- **The old `yeslove` client** still allows direct password grants, the implicit flow and a wildcard redirect. Tighten it once old builds are gone (`mobile_client.py status` lists what to change).
- The Keycloak login page is Keycloak's default theme until a branded theme is added.
