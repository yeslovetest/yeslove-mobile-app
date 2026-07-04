import { call, put, takeEvery, takeLatest, race, delay } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosResponse } from "axios";

import {
  AuthApiFactory,
  ChangePasswordRequest,
  DeleteAccountRequest,
  LoginRequest,
  ProfileApiFactory,
  SignupRequest,
  SignupResponse,
  TokenResponse,
  UserProfile,
} from "@/generated-api";
import { TOKEN_REFRESH_SERVICE } from "@/ts/token-service";

import { appSelect } from "../hooks";
import {
  attemptRefreshFromLocalStorageAction,
  logInAction,
  LoginState,
  logoutAction,
  setDeleteConfirmation,
  setErrorMessage,
  setLoginStateAction,
  setMessage,
  setSignupMessage,
  setSignupSubmitting,
  setUserPassword,
  signupAction,
} from "../Auth-store/authSlice";
import { setName, setPassword, setUserDBID, setUserId } from "../Profile-store/userSlice";
import {
  activateLoadingScreen,
  setEmailNotificationSettings,
  setProfileVisibilitySettings,
  storeUserDataAction,
} from "../Profile-store/profileSlice";
import { changeTabAction, TabType } from "../Navigation/navigationSlice";
import { setFeedDataAction } from "../Home-store/feedSlice";
import { setChatMessages, setFriendList } from "../Chat/chatSlice";
import { syncUser, UserIdentityResponse } from "../../services/authService";
import { getApiMessage, getHttpStatus } from "./sagaHelpers";

const clearPersistedAuthState = async (): Promise<void> => {
  TOKEN_REFRESH_SERVICE.stopRefreshingToken();
  await TOKEN_REFRESH_SERVICE.saveRefreshTokenToLocalStorage("");
  await TOKEN_REFRESH_SERVICE.saveAccessToken("");
  await TOKEN_REFRESH_SERVICE.saveUserIdToLocalStorage("");
  await TOKEN_REFRESH_SERVICE.saveUserDBIDToLocalStorage(-1);
  delete axios.defaults.headers.common["Authorization"];
};

/**
 * Translate signup HTTP failures into user-friendly guidance.
 */
const getSignupFriendlyMessage = (status?: number, apiMessage?: string): string => {
  if (apiMessage) {
    return apiMessage;
  }

  if (status === 400) {
    return "Please check your details and try again.";
  }

  if (status === 401 || status === 403) {
    return "You are not allowed to complete signup right now. Please try again later.";
  }

  if (status === 409) {
    return "An account with these details already exists.";
  }

  if (status === 429) {
    return "Too many signup attempts. Please wait a moment and try again.";
  }

  if (status && status >= 500) {
    return "Server is busy right now. Please try again shortly.";
  }

  return "We could not complete signup right now. Please try again.";
};
function* handleLoginRequest(action: PayloadAction<LoginRequest>) {
  const request = action.payload;

  type LoginResponseWithIdentity = TokenResponse & {
    keycloak_id?: string;
    user_id?: number;
  };

  let loginResponse: LoginResponseWithIdentity;

  try {
    loginResponse = (
      (yield call(AuthApiFactory().postLogin, request)) as AxiosResponse<LoginResponseWithIdentity>
    ).data as LoginResponseWithIdentity;
  } catch (error) {
    console.error("Login failed:", error);

    const status = getHttpStatus(error);
    const apiMessage = getApiMessage(error);
    let friendlyMessage = apiMessage;

    if (!friendlyMessage) {
      // Map technical auth failures to user-facing messages.
      if (status === 400 || status === 401) {
        friendlyMessage = "Incorrect login details. Please check and try again.";
      } else if (status === 429) {
        friendlyMessage = "Too many attempts. Please wait a moment and try again.";
      } else {
        friendlyMessage = "Unable to sign in right now. Please try again.";
      }
    }

    yield put(setErrorMessage(friendlyMessage));
    yield put(setLoginStateAction(LoginState.LOGGED_OUT));
    yield put(activateLoadingScreen(false));
    return;
  }
  //console.log('Login successful:', loginResponse);
  const accessToken = loginResponse.access_token ?? "";
  const refreshToken = loginResponse.refresh_token ?? "";

  // A successful login response should always route the user to home.
  // Any post-login sync/storage failures are treated as best-effort warnings.
  try {
    axios.defaults.headers.common["Authorization"] = accessToken ? `Bearer ${accessToken}` : "";
    yield call([TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.saveAccessToken], accessToken);

    if (refreshToken) {
      TOKEN_REFRESH_SERVICE.startRefreshingToken(refreshToken);
    } else {
      TOKEN_REFRESH_SERVICE.stopRefreshingToken();
    }
    yield call(
      [TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.saveRefreshTokenToLocalStorage],
      refreshToken,
    );

    // Never fail a successful auth response because local sync/lookup is delayed.
    let resolvedKeycloakId = loginResponse.keycloak_id ?? "";
    let resolvedUserDbId = typeof loginResponse.user_id === "number" ? loginResponse.user_id : -1;

    // Ensure local DB user exists for protected endpoints that depend on backend user rows.
    try {
      const syncResponse = (yield call(syncUser, request.username)) as UserIdentityResponse;

      if (syncResponse?.keycloak_id) {
        resolvedKeycloakId = syncResponse.keycloak_id;
      }

      if (typeof syncResponse?.user_id === "number") {
        resolvedUserDbId = syncResponse.user_id;
      }
    } catch (syncError) {
      console.warn("sync_user failed, falling back to profile lookup", syncError);
    }

    if (!resolvedKeycloakId) {
      try {
        const identityResponse = (
          (yield call(
            ProfileApiFactory().postGetUserKeycloakId,
          )) as AxiosResponse<UserIdentityResponse>
        ).data as UserIdentityResponse;

        if (identityResponse?.keycloak_id) {
          resolvedKeycloakId = identityResponse.keycloak_id;
        }

        if (typeof identityResponse?.user_id === "number") {
          resolvedUserDbId = identityResponse.user_id;
        }
      } catch (identityError) {
        console.warn("profile identity lookup failed after login", identityError);
      }
    }

    if (!resolvedKeycloakId) {
      console.warn("login succeeded but keycloak_id is unavailable; continuing to logged-in state");
    }

    yield call(
      [TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.saveUserIdToLocalStorage],
      resolvedKeycloakId,
    );
    yield call(
      [TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.saveUserDBIDToLocalStorage],
      resolvedUserDbId,
    );
    yield put(setUserId(resolvedKeycloakId));
    yield put(setUserDBID(resolvedUserDbId));
    yield put(setName(request.username));
    yield put(setPassword(request.password));
  } catch (postLoginError) {
    console.warn("post-login setup failed; continuing to logged-in state", postLoginError);
  }

  yield put(setErrorMessage(""));
  yield put(setLoginStateAction(LoginState.LOGGED_IN));
  yield put(activateLoadingScreen(false));
}

function* refreshFromLocalStorage(action: PayloadAction<void>) {
  try {
    const refreshToken = (yield call([
      TOKEN_REFRESH_SERVICE,
      TOKEN_REFRESH_SERVICE.loadRefreshTokenFromLocalStorage,
    ])) as string | null;
    const normalizedRefreshToken = (refreshToken || "").trim();

    if (!normalizedRefreshToken) {
      yield put(setErrorMessage(""));
      yield put(setLoginStateAction(LoginState.LOGGED_OUT));
      return;
    }

    try {
      // Enforce a hard timeout so bootstrap can never keep the app in LOADING forever.
      const refreshResult: {
        refreshedResponse?: AxiosResponse<TokenResponse>;
        timedOut?: true;
      } = yield race({
        refreshedResponse: call(
          AuthApiFactory().postRefreshToken,
          { refresh_token: normalizedRefreshToken },
          { timeout: 10000 },
        ),
        timedOut: delay(12000),
      });

      if (refreshResult.timedOut || !refreshResult.refreshedResponse) {
        throw new Error("AUTH_BOOTSTRAP_TIMEOUT");
      }

      const refreshResponse = refreshResult.refreshedResponse.data as TokenResponse;
      const refreshedAccessToken = refreshResponse.access_token ?? "";
      const refreshedRefreshToken = refreshResponse.refresh_token ?? "";

      // Never keep the user in a partial session when provider does not return both tokens.
      if (!refreshedAccessToken || !refreshedRefreshToken) {
        throw new Error("AUTH_TOKENS_MISSING");
      }

      axios.defaults.headers.common["Authorization"] = refreshedAccessToken
        ? `Bearer ${refreshedAccessToken}`
        : "";
      yield call(
        [TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.saveAccessToken],
        refreshedAccessToken,
      );

      if (refreshedRefreshToken) {
        TOKEN_REFRESH_SERVICE.startRefreshingToken(refreshedRefreshToken);
      } else {
        TOKEN_REFRESH_SERVICE.stopRefreshingToken();
      }

      yield call(
        [TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.saveRefreshTokenToLocalStorage],
        refreshedRefreshToken,
      );

      const storedUserId = (yield call([
        TOKEN_REFRESH_SERVICE,
        TOKEN_REFRESH_SERVICE.loadUserIdFromLocalStorage,
      ])) as string | null;
      const storedUserDbId = (yield call([
        TOKEN_REFRESH_SERVICE,
        TOKEN_REFRESH_SERVICE.loadUserDBIDFromLocalStorage,
      ])) as string | null;

      if (!storedUserId) {
        yield put(setLoginStateAction(LoginState.LOGGED_OUT));
        try {
          yield call(clearPersistedAuthState);
        } catch (cleanupError) {
          console.warn("auth cleanup failed after missing stored user id", cleanupError);
        }
        return;
      }

      yield put(setUserId(storedUserId));
      yield put(setUserDBID(storedUserDbId ? Number(storedUserDbId) : -1));

      let userId: string = yield appSelect((state) => state.user.id);

      // Profile fetch is best-effort during bootstrap; do not block login routing if slow.
      const profileResult: {
        profileResponse?: AxiosResponse<UserProfile>;
        timedOut?: true;
      } = yield race({
        profileResponse: call(ProfileApiFactory().getUserProfile, userId, { timeout: 8000 }),
        timedOut: delay(9000),
      });

      if (profileResult.profileResponse?.data) {
        const profile = profileResult.profileResponse.data as UserProfile;
        yield put(setName(profile.username));
        yield put(storeUserDataAction({ id: userId, profile: profile }));
      }

      yield put(setErrorMessage(""));
      yield put(setLoginStateAction(LoginState.LOGGED_IN));
    } catch (error) {
      console.log(error);

      const status = getHttpStatus(error);
      const apiMessage = getApiMessage(error);
      const isTimeoutError = error instanceof Error && error.message === "AUTH_BOOTSTRAP_TIMEOUT";
      const isMissingTokensError =
        error instanceof Error && error.message === "AUTH_TOKENS_MISSING";

      if (isTimeoutError) {
        yield put(setErrorMessage("Connection took too long. Please sign in again."));
      } else if (isMissingTokensError) {
        yield put(setErrorMessage("Session refresh failed. Please sign in again."));
      } else if (status === 400 || status === 401) {
        yield put(setErrorMessage(apiMessage || "Your session expired. Please sign in again."));
      } else if (status && status >= 500) {
        yield put(setErrorMessage("Server is busy right now. Please try again shortly."));
      } else if (apiMessage) {
        yield put(setErrorMessage(apiMessage));
      } else {
        yield put(
          setErrorMessage("We could not reconnect automatically. Please sign in to continue."),
        );
      }

      // Route first, then cleanup as best-effort so UI cannot get stuck in LOADING.
      yield put(setLoginStateAction(LoginState.LOGGED_OUT));
      try {
        yield call(clearPersistedAuthState);
      } catch (cleanupError) {
        console.warn("auth cleanup failed after refresh error", cleanupError);
      }
    }
  } catch (storageError) {
    console.warn("failed to load stored auth tokens", storageError);
    yield put(setErrorMessage("We could not read your session. Please sign in again."));
    yield put(setLoginStateAction(LoginState.LOGGED_OUT));
  }
}

function* handleSignupRequest(action: PayloadAction<SignupRequest>) {
  let request = action.payload;

  // Keep UI actions disabled while signup request is in progress.
  yield put(setSignupSubmitting(true));

  try {
    const signupResponse = (
      (yield call(AuthApiFactory().postSignup, request)) as AxiosResponse<SignupResponse>
    ).data as SignupResponse;

    // Keep provider response message so success screen can show meaningful text.
    yield put(setSignupMessage(signupResponse.message ?? ""));
  } catch (error) {
    console.error("Sign up failed", error);

    const status = getHttpStatus(error);
    const apiMessage = getApiMessage(error);
    const friendlyMessage = getSignupFriendlyMessage(status, apiMessage);

    // Render a user-safe error on the signup result screen.
    yield put(setSignupMessage(friendlyMessage));
  } finally {
    // Always re-enable signup actions after completion.
    yield put(setSignupSubmitting(false));
  }
}

function* handleLogout(action: PayloadAction<string>) {
  try {
    if (action.payload) {
      yield call(AuthApiFactory().postLogout, { refresh_token: action.payload });
    }
  } catch (error) {
    console.warn("Logout API call failed, continuing local logout cleanup", error);
  }

  try {
    // Always clear local auth/session state, even if provider logout fails.
    yield call(clearPersistedAuthState);
    yield put(changeTabAction({ type: TabType.HOME }));
    yield put(setLoginStateAction(LoginState.LOGGED_OUT));
    yield put(setFeedDataAction({ post: [], feedType: "friends" }));
    yield put(setFeedDataAction({ post: [], feedType: "all" }));
    yield put(setEmailNotificationSettings([]));
    yield put(setProfileVisibilitySettings([]));
    yield put(setChatMessages([]));
    yield put(setFriendList([]));
    yield put(activateLoadingScreen(false));
  } catch (error) {
    console.error("Logout Failed!", error);
    yield put(activateLoadingScreen(false));
  }
}

function* handlePasswordChange(action: PayloadAction<ChangePasswordRequest>) {
  let request = action.payload;

  try {
    yield call(AuthApiFactory().postChangePassword, request);
    yield put(setMessage("Password change successful!"));
    yield put(setPassword(request.new_password));
  } catch (error) {
    console.error("password change failed", error);
  }
}

function* handleDeleteAccount(action: PayloadAction<DeleteAccountRequest>) {
  const refreshToken = (yield call([
    TOKEN_REFRESH_SERVICE,
    TOKEN_REFRESH_SERVICE.loadRefreshTokenFromLocalStorage,
  ])) as string;
  try {
    yield call(AuthApiFactory().deleteDeleteAccount, action.payload);
    yield put(logoutAction(refreshToken || ""));
  } catch (error) {
    console.error("Delete action failed", error);
  }
}

export default function* authSaga() {
  yield takeEvery(logInAction.type, handleLoginRequest);
  // Keep only one bootstrap refresh in-flight to avoid overlapping loading states.
  yield takeLatest(attemptRefreshFromLocalStorageAction.type, refreshFromLocalStorage);
  yield takeEvery(signupAction.type, handleSignupRequest);
  yield takeEvery(setUserPassword.type, handlePasswordChange);
  yield takeEvery(setDeleteConfirmation.type, handleDeleteAccount);
  yield takeEvery(logoutAction.type, handleLogout);
}
