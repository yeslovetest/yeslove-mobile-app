import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { TOKEN_REFRESH_SERVICE } from "@/ts/token-service";

import { BASE_URL } from "./baseUrl";

/**
 * Central configuration for the global axios instance used by the generated API
 * client (which defaults to `globalAxios`) and the app's raw axios calls.
 *
 * Adds a reactive auth flow: when a request fails with 401, refresh the access
 * token once and retry the original request. Concurrent 401s share a single
 * refresh call (single-flight), and auth endpoints are exempt so a failing
 * refresh can never loop.
 */

// Requests to these paths must never trigger refresh-and-retry (prevents loops).
const AUTH_BYPASS_PATHS = [
  "/api/auth/login",
  "/api/auth/refresh_token",
  "/api/auth/logout",
  "/api/auth/signup",
];

type AuthFailureHandler = () => void;

// No-op until the app registers a real handler. Kept as a callback so this
// module never imports the Redux store (avoids an import cycle).
let onAuthFailure: AuthFailureHandler = () => {};

/**
 * Register what should happen when reactive refresh fails — typically routing
 * the user back to sign-in.
 */
export const registerAuthFailureHandler = (handler: AuthFailureHandler): void => {
  onAuthFailure = handler;
};

// Single-flight: many parallel 401s must trigger only one refresh call.
let refreshInFlight: Promise<string | null> | null = null;

const refreshAccessTokenOnce = (): Promise<string | null> => {
  if (!refreshInFlight) {
    refreshInFlight = TOKEN_REFRESH_SERVICE.refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
};

const isAuthBypass = (url?: string): boolean =>
  !!url && AUTH_BYPASS_PATHS.some((path) => url.includes(path));

let configured = false;

/**
 * Configure the global axios instance. Idempotent — safe to call more than once.
 */
export const configureHttpClient = (): void => {
  if (configured) {
    return;
  }
  configured = true;

  axios.defaults.baseURL = BASE_URL;

  axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const original = error.config as
        (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

      // Only handle the first 401 on a non-auth request; everything else passes through.
      if (status !== 401 || !original || original._retry || isAuthBypass(original.url)) {
        return Promise.reject(error);
      }

      original._retry = true;

      const newAccessToken = await refreshAccessTokenOnce();
      if (!newAccessToken) {
        onAuthFailure();
        return Promise.reject(error);
      }

      // headers on a live request config is an AxiosHeaders instance.
      original.headers.set("Authorization", `Bearer ${newAccessToken}`);
      return axios(original);
    },
  );
};
