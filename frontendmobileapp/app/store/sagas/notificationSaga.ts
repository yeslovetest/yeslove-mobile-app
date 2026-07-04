import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";

import {
  FeedApiFactory,
  NotificationListResponse,
  NotificationPreferences,
  NotificationsApiFactory,
} from "@/generated-api";

import { appSelect } from "../hooks";
import {
  fetchFriendRequests,
  fetchNotificationPreferences,
  fetchUserNotifications,
  markNotificationRead,
  respondToFriendRequest,
  setFriendRequests,
  setNotificationPreferences,
  setNotificationRequestFailed,
  setUserNotification,
  updateNotificationPreferences,
} from "../Notification-store/notificationSlice";
import { fetchFollowedUsers } from "../Home-store/feedSlice";
import { fetchFriendList } from "../Chat/chatSlice";
import { setMessage } from "../Auth-store/authSlice";
import { getFriendRequests, FriendRequestsResponse } from "../../services/feedService";

function* handleGetUserNotifications(
  action: PayloadAction<{ perPage?: number; currentPage?: number }>,
) {
  try {
    const response = (
      (yield call(
        NotificationsApiFactory().getNotificationList,
        action.payload.perPage ?? undefined,
        action.payload.currentPage ?? undefined,
      )) as AxiosResponse<NotificationListResponse>
    ).data as NotificationListResponse;
    yield put(setUserNotification(response));

    // Keep follow-state current so "Requested" can flip to "Friend" (or clear after decline)
    // as soon as notifications are refreshed.
    yield put(fetchFollowedUsers());
  } catch (error) {
    console.error("failed to retrieve notification", error);
    yield put(setNotificationRequestFailed());
  }
}

function* updateNotificationOpened(action: PayloadAction<number>) {
  try {
    yield call(NotificationsApiFactory().postMarkNotificationRead, action.payload);
    yield put(fetchUserNotifications({}));
  } catch (error) {
    console.error("failed to update notification", error);
  }
}

function* handleGetFriendRequests(action: PayloadAction<void>) {
  try {
    const response = (yield call(getFriendRequests)) as FriendRequestsResponse;
    yield put(setFriendRequests(response.requests ?? []));
  } catch (error) {
    console.error("failed to retrieve friend requests", error);
    yield put(setFriendRequests([]));
  }
}

function* handleRespondFriendRequest(
  action: PayloadAction<{ keycloakId: string; decision: "accept" | "decline" }>,
) {
  try {
    if (action.payload.decision === "accept") {
      yield call(FeedApiFactory().postFollowUser, action.payload.keycloakId, {
        action: "follow",
        follow_type: "friend",
      });
    } else {
      yield call(FeedApiFactory().postFollowUser, action.payload.keycloakId, {
        action: "decline",
        follow_type: "friend",
      });
    }

    const currentPerPage = (yield appSelect((state) => state.notification.perPage)) as number;
    yield put(fetchFriendRequests());
    yield put(fetchUserNotifications({ currentPage: 1, perPage: currentPerPage }));
    yield put(fetchFollowedUsers());
    yield put(fetchFriendList((yield appSelect((state) => state.user.id)) as string));
  } catch (error) {
    console.error("failed to respond to friend request", error);
  }
}

function* handleGetNotificationPreferences(action: PayloadAction<void>) {
  try {
    const response = (yield call(
      NotificationsApiFactory().getNotificationPreferencesResource,
    )) as AxiosResponse<NotificationPreferences>;
    yield put(
      setNotificationPreferences({
        posts: !!response.data.posts,
        likes: !!response.data.likes,
        comments: !!response.data.comments,
        events: !!response.data.events,
        blogs: !!response.data.blogs,
      }),
    );
  } catch (error) {
    console.error("failed to fetch notification preferences", error);
  }
}

function* handleUpdateNotificationPreferences(
  action: PayloadAction<{ preferences: NotificationPreferences }>,
) {
  try {
    yield call(
      NotificationsApiFactory().putNotificationPreferencesResource,
      action.payload.preferences,
    );
    yield put(setMessage("Notification Preferences Saved!"));
  } catch (error) {
    console.error("notification preferences setting failed", error);
  }
}

export default function* notificationSaga() {
  // Keep only one notifications list request active to avoid duplicate page appends.
  yield takeLatest(fetchUserNotifications.type, handleGetUserNotifications);
  yield takeEvery(markNotificationRead.type, updateNotificationOpened);
  yield takeEvery(fetchFriendRequests.type, handleGetFriendRequests);
  yield takeEvery(respondToFriendRequest.type, handleRespondFriendRequest);
  yield takeEvery(fetchNotificationPreferences.type, handleGetNotificationPreferences);
  yield takeEvery(updateNotificationPreferences.type, handleUpdateNotificationPreferences);
}
