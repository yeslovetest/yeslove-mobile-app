import { call, put, takeEvery } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosResponse } from "axios";

import {
  ChatApiFactory,
  GetFriendsResponse,
  GetMessagesResponse,
  MarkChatOpenedResponse,
} from "@/generated-api";
import { normalizeMediaFiles } from "./sagaHelpers";

import {
  fetchChatMessages,
  fetchFriendList,
  markChatOpened,
  sendChatMessage,
  sendChatMessageFailed,
  sendChatMessageStarted,
  sendChatMessageSucceeded,
  setChatMessages,
  setFriendList,
} from "../Chat/chatSlice";
import { setUploadedMediaId } from "../Profile-store/mediaSlice";

function* handleGetMessages(action: PayloadAction<string>) {
  const messages = (
    (yield call(
      ChatApiFactory().getGetMessages,
      action.payload,
      {},
    )) as AxiosResponse<GetMessagesResponse>
  ).data as GetMessagesResponse;
  yield put(setChatMessages(messages.messages ?? []));
}

function* handlePostSendMessage(
  action: PayloadAction<{
    id: string;
    message: string;
    mediaFiles?: Array<{ uri: string; type: string; name?: string }>;
  }>,
) {
  try {
    yield put(sendChatMessageStarted());
    // Keep payload aligned with backend parser: repeated "media" files.
    const normalizedMedia = normalizeMediaFiles(action.payload.mediaFiles);

    yield call(
      ChatApiFactory().postSendMessage,
      action.payload.id,
      action.payload.message ?? undefined,
      normalizedMedia.length ? (normalizedMedia as any) : undefined,
      {
        timeout: 60000, // Enforce a timeout since media uploads can fail silently on mobile networks; this ensures we can show an error and re-enable the UI.
      },
    );

    yield put(fetchChatMessages(action.payload.id));
    yield put(setUploadedMediaId([]));
    yield put(sendChatMessageSucceeded());
  } catch (error) {
    console.error("failed to send message", error);
    if (axios.isAxiosError(error) && !error.response) {
      console.error("chat send network details", {
        baseURL: axios.defaults.baseURL,
        url: "ChatApiFactory.postSendMessage",
        message: error.message,
      });
    }
    yield put(sendChatMessageFailed("Unable to send your message right now. Please try again."));
  }
}

function* updateChatOpened(action: PayloadAction<string>) {
  try {
    const response = (
      (yield call(
        ChatApiFactory().putMarkChatOpened,
        action.payload,
      )) as AxiosResponse<MarkChatOpenedResponse>
    ).data as MarkChatOpenedResponse;
    //console.log(response.message);
  } catch (error) {
    console.error("failed to mark chat opened", error);
  }
}

function* handleGetFriendList(action: PayloadAction<string>) {
  const currentUserId = (action.payload ?? "").trim();
  if (!currentUserId) {
    yield put(setFriendList([]));
    return;
  }

  try {
    const friends = (
      (yield call(ChatApiFactory().getGetFriends, currentUserId, {
        keycloak_id: currentUserId,
      })) as AxiosResponse<GetFriendsResponse>
    ).data as GetFriendsResponse;
    yield put(setFriendList(friends.friends ?? []));
  } catch (error) {
    console.error("failed to fetch friends list", error);
    yield put(setFriendList([]));
  }
}

export default function* chatSaga() {
  yield takeEvery(fetchChatMessages.type, handleGetMessages);
  yield takeEvery(sendChatMessage.type, handlePostSendMessage);
  yield takeEvery(markChatOpened.type, updateChatOpened);
  yield takeEvery(fetchFriendList.type, handleGetFriendList);
}
