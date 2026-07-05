import { call, put, takeEvery } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";

import {
  EmailNotificationSettings,
  ProfileApiFactory,
  ProfileVisibilitySettings,
  TimelineResponse,
  UserProfile,
} from "@/generated-api";

import { appSelect } from "../hooks";
import {
  fetchUserDataAction,
  fetchUserTimelineAction,
  fetchUserTimelineNextPageAction,
  getEmailNotificationSettings,
  getProfileVisibilitySettings,
  persistUserInfoAction,
  setEmailNotificationSettings,
  setProfileImageUploading,
  setProfileVisibilitySettings,
  setUserProfileState,
  setUserTimelineAction,
  setUserTimelineFailedAction,
  storeUserDataAction,
  updateEmailNotificationSettings,
  updateProfile,
  updateProfileVisibilitySettings,
} from "../Profile-store/profileSlice";
import { setName } from "../Profile-store/userSlice";
import { setMessage } from "../Auth-store/authSlice";
import { updateProfileWithMedia } from "../../services/profileService";

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* saveProfileInfoEffect(action: any) {
  let userId: string = yield appSelect((state: { user: { id: any } }) => state.user.id);
  let info: UserProfile = yield appSelect((state) => state.profile.profiles[userId]);
  ProfileApiFactory()
    .putUpdateProfile(info)
    .catch((reason) => console.log("Failed to update user profile: " + reason));
}

function* fetchUserProfileData(action: PayloadAction<{ id: string; isCurrentUser: boolean }>) {
  let info: UserProfile = yield appSelect((state) => state.profile.profiles[action.payload.id]);
  yield put(setUserProfileState(action.payload.isCurrentUser));
  if (!info) {
    const profile = (
      (yield call(
        ProfileApiFactory().getUserProfile,
        action.payload.id,
      )) as AxiosResponse<UserProfile>
    ).data as UserProfile;
    yield put(storeUserDataAction({ id: action.payload.id, profile: profile }));
  }
}

function* fetchProfileTimeline(
  action: PayloadAction<{ id: string; perPage?: number; page?: number; reset?: boolean }>,
) {
  const keycloakId = (action.payload.id ?? "").trim();
  if (!keycloakId) {
    yield put(setUserTimelineFailedAction({ message: "Timeline user id is missing." }));
    return;
  }

  const currentTimeline = (yield appSelect((state) => state.profile.timeline)) as {
    keycloakId: string;
    currentPage: number;
    perPage: number;
    hasMore: boolean;
    loading: boolean;
    fetchingMore: boolean;
  };

  const isReset = !!action.payload.reset || (action.payload.page ?? 1) <= 1;
  if (!isReset) {
    if (currentTimeline.loading || currentTimeline.fetchingMore || !currentTimeline.hasMore) {
      return;
    }

    if (currentTimeline.keycloakId && currentTimeline.keycloakId !== keycloakId) {
      return;
    }
  }

  const perPage = action.payload.perPage ?? currentTimeline.perPage ?? 10;
  const fallbackPage = isReset ? 1 : (currentTimeline.currentPage || 0) + 1;
  const page = action.payload.page ?? fallbackPage;

  try {
    const response = (
      (yield call(
        ProfileApiFactory().getUserTimeline,
        keycloakId,
        perPage,
        page,
      )) as AxiosResponse<TimelineResponse>
    ).data as TimelineResponse;
    yield put(
      setUserTimelineAction({
        id: keycloakId,
        posts: response.posts ?? [],
        total: response.total ?? 0,
        perPage: response.per_page ?? perPage,
        currentPage: response.current_page ?? page,
      }),
    );
  } catch (error) {
    console.error("failed to fetch user timeline", error);
    yield put(setUserTimelineFailedAction({ message: "Unable to load timeline right now." }));
  }
}

function* fetchProfileTimelineNextPage(action: PayloadAction<{ id: string; perPage?: number }>) {
  const timeline = (yield appSelect((state) => state.profile.timeline)) as {
    currentPage: number;
    perPage: number;
    hasMore: boolean;
    loading: boolean;
    fetchingMore: boolean;
    keycloakId: string;
  };

  if (timeline.loading || timeline.fetchingMore || !timeline.hasMore) {
    return;
  }

  if (timeline.keycloakId && timeline.keycloakId !== action.payload.id) {
    return;
  }

  const nextPage = (timeline.currentPage || 0) + 1;
  yield put(
    fetchUserTimelineAction({
      id: action.payload.id,
      perPage: action.payload.perPage ?? timeline.perPage,
      page: nextPage,
    }),
  );
}

function* updateUserProfile(
  action: PayloadAction<{
    data?: Partial<UserProfile>;
    file?: FormData;
    resolve?: () => void;
    reject?: (error: unknown) => void;
  }>,
) {
  try {
    const profileApi = ProfileApiFactory();
    const profilePayload = (action.payload.data ?? {}) as UserProfile;

    if (action.payload.file) {
      yield put(setProfileImageUploading(true));
    }

    if (action.payload.file) {
      yield call(updateProfileWithMedia, action.payload.file);
    } else {
      yield call({ context: profileApi, fn: profileApi.putUpdateProfile }, profilePayload);
    }

    let userId: string = yield appSelect((state) => state.user.id);
    const profile = (
      (yield call(ProfileApiFactory().getUserProfile, userId)) as AxiosResponse<UserProfile>
    ).data as UserProfile;
    yield put(setName(profile.username));
    yield put(storeUserDataAction({ id: userId, profile: profile }));
    yield put(fetchUserTimelineAction({ id: userId, page: 1, perPage: 10, reset: true }));

    if (action.payload.resolve) {
      action.payload.resolve();
    }
  } catch (error) {
    console.error("failed to upload media", error);

    if (action.payload.reject) {
      action.payload.reject(error);
    }
  } finally {
    if (action.payload.file) {
      yield put(setProfileImageUploading(false));
    }
  }
}

function* fetchEmailNotificationSettings(action: PayloadAction<void>) {
  const emailNotificationSettings = (
    (yield call(
      ProfileApiFactory().getEmailNotifications,
    )) as AxiosResponse<EmailNotificationSettings>
  ).data as EmailNotificationSettings;
  yield put(setEmailNotificationSettings(emailNotificationSettings.settings ?? []));
}

function* updateEmailSettings(action: PayloadAction<EmailNotificationSettings>) {
  try {
    yield call(ProfileApiFactory().postEmailNotifications, action.payload);
    yield put(setMessage("Email Notification Settings Saved!"));
  } catch (error) {
    console.error("email notification setting failed", error);
  }
}

function* fetchProfileVisiblitySettings(action: PayloadAction<void>) {
  const profileVisibilitySettings = (
    (yield call(
      ProfileApiFactory().getProfileVisibility,
    )) as AxiosResponse<ProfileVisibilitySettings>
  ).data as ProfileVisibilitySettings;
  yield put(setProfileVisibilitySettings(profileVisibilitySettings.settings ?? []));
}

function* updateProfileSettings(action: PayloadAction<ProfileVisibilitySettings>) {
  try {
    yield call(ProfileApiFactory().postProfileVisibility, action.payload);
    yield put(setMessage("Profile Visibility Settings Saved!"));
  } catch (error) {
    console.error("profile visibility setting failed", error);
  }
}

export default function* profileSaga() {
  yield takeEvery(fetchUserDataAction.type, fetchUserProfileData);
  yield takeEvery(fetchUserTimelineAction.type, fetchProfileTimeline);
  yield takeEvery(fetchUserTimelineNextPageAction.type, fetchProfileTimelineNextPage);
  yield takeEvery(persistUserInfoAction.type, saveProfileInfoEffect);
  yield takeEvery(updateProfile.type, updateUserProfile);
  yield takeEvery(getEmailNotificationSettings.type, fetchEmailNotificationSettings);
  yield takeEvery(updateEmailNotificationSettings.type, updateEmailSettings);
  yield takeEvery(getProfileVisibilitySettings.type, fetchProfileVisiblitySettings);
  yield takeEvery(updateProfileVisibilitySettings.type, updateProfileSettings);
}
