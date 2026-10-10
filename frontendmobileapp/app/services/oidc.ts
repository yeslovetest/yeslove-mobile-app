/**
 * Browser sign-in with Keycloak (authorization code + PKCE), stage 3 of the MFA plan.
 *
 * The member signs in on Keycloak's own page in the system browser sheet, so the password
 * (and any one-time code) goes to Keycloak and never through our API. The app only ever holds
 * the resulting tokens. It uses the public client `yeslove-mobile`: a phone app cannot keep a
 * client secret, and PKCE protects the code exchange instead.
 *
 * Switched on per build with EXPO_PUBLIC_BROWSER_SIGN_IN=true. Until then the app keeps using
 * the password form and the API's /api/auth/login, exactly as before.
 */
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

import { AuthApiFactory } from "@/generated-api";
import { secureGet, secureSet } from "@/ts/secureStorage";

WebBrowser.maybeCompleteAuthSession();

const KEYCLOAK_URL = (process.env.EXPO_PUBLIC_KEYCLOAK_URL ?? "https://auth.yeslove.co.uk").replace(/\/+$/, "");
const REALM = process.env.EXPO_PUBLIC_KEYCLOAK_REALM ?? "YesLove_Auth";
const CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_MOBILE_CLIENT_ID ?? "yeslove-mobile";

export const BROWSER_SIGN_IN_ENABLED = process.env.EXPO_PUBLIC_BROWSER_SIGN_IN === "true";

// Keycloak matches redirect URIs exactly: this must equal the client's redirect list
// (KeyCloakService/scripts/mobile_client.py) and the `yeslove` scheme in app.json.
export const REDIRECT_URI = "yeslove://auth/callback";

const ISSUER = `${KEYCLOAK_URL}/realms/${REALM}`;
export const DISCOVERY = {
  authorizationEndpoint: `${ISSUER}/protocol/openid-connect/auth`,
  tokenEndpoint: `${ISSUER}/protocol/openid-connect/token`,
  endSessionEndpoint: `${ISSUER}/protocol/openid-connect/logout`,
  revocationEndpoint: `${ISSUER}/protocol/openid-connect/revoke`,
};
// Keycloak account console, opened on the "Signing in" page where a member sets their password,
// an authenticator app and (with the feature on) passkeys and recovery codes.
export const ACCOUNT_SECURITY_URL = `${ISSUER}/account/#/security/signing-in`;

export type SessionTokens = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

export class BrowserSignInCancelled extends Error {
  constructor() {
    super("Sign-in was cancelled");
    this.name = "BrowserSignInCancelled";
  }
}

const AUTH_MODE_KEY = "authMode";
export type AuthMode = "browser" | "password";

export const getAuthMode = async (): Promise<AuthMode> =>
  (await secureGet(AUTH_MODE_KEY)) === "browser" ? "browser" : "password";

export const setAuthMode = (mode: AuthMode): Promise<void> => secureSet(AUTH_MODE_KEY, mode);

/** Open Keycloak's sign-in page and return the tokens. Throws BrowserSignInCancelled if closed. */
export const signInWithBrowser = async (): Promise<SessionTokens> => {
  const request = new AuthSession.AuthRequest({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    scopes: ["openid", "profile", "email"],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  });
  // Ephemeral: the sheet does not share cookies with Safari, so a previous member's Keycloak
  // session on a shared phone is never reused.
  const result = await request.promptAsync(DISCOVERY, { preferEphemeralSession: true });

  if (result.type === "cancel" || result.type === "dismiss") {
    throw new BrowserSignInCancelled();
  }
  if (result.type !== "success") {
    const message = result.type === "error" ? result.error?.message : undefined;
    throw new Error(message || "Sign-in did not complete");
  }

  const tokens = await AuthSession.exchangeCodeAsync(
    {
      clientId: CLIENT_ID,
      code: result.params.code,
      redirectUri: REDIRECT_URI,
      extraParams: { code_verifier: request.codeVerifier ?? "" },
    },
    DISCOVERY,
  );
  return {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken ?? "",
    expires_in: tokens.expiresIn,
  };
};

// fetch, not axios: the shared axios instance would attach the member's access token to a
// request to Keycloak's token endpoint.
const postForm = async (url: string, fields: Record<string, string>, timeoutMs: number): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(fields).toString(),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Exchange a refresh token for new tokens. Browser sessions talk to Keycloak directly (the
 * public client); password sessions keep using the API, because a refresh token only works with
 * the client that issued it.
 */
export const refreshSession = async (
  refreshToken: string,
  timeoutMs = 10000,
): Promise<SessionTokens> => {
  if ((await getAuthMode()) === "browser") {
    const response = await postForm(
      DISCOVERY.tokenEndpoint,
      { grant_type: "refresh_token", client_id: CLIENT_ID, refresh_token: refreshToken },
      timeoutMs,
    );
    if (!response.ok) {
      throw new Error(`Session refresh failed (${response.status})`);
    }
    return (await response.json()) as SessionTokens;
  }
  const response = await AuthApiFactory().postRefreshToken(
    { refresh_token: refreshToken },
    { timeout: timeoutMs },
  );
  return response.data as SessionTokens;
};

/** End the Keycloak session for a browser sign-in. Best effort; the app also clears its tokens. */
export const endBrowserSession = async (refreshToken: string): Promise<void> => {
  if (!refreshToken) return;
  try {
    await postForm(DISCOVERY.endSessionEndpoint, { client_id: CLIENT_ID, refresh_token: refreshToken }, 8000);
  } catch {
    // The refresh token expires on its own; signing out locally still happens.
  }
};

/** The username claim from an access token (display only; the API checks the token itself). */
export const usernameFromAccessToken = (accessToken: string): string => {
  try {
    const payload = accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(decodeURIComponent(escape(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")))));
    return typeof json.preferred_username === "string" ? json.preferred_username : "";
  } catch {
    return "";
  }
};
