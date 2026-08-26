import { call, put, takeEvery } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";

import { MediaApiFactory, MediaListResponse } from "@/generated-api";

import {
  fetchMediaItems,
  setMediaItems,
  setUploadedMediaId,
  uploadBulkMedia,
  uploadMedia,
} from "../Profile-store/mediaSlice";

function* handleGetUserMediaItems(action: PayloadAction<number>) {
  const MediaItems = (
    (yield call(
      MediaApiFactory().getGetUserMedia,
      action.payload,
    )) as AxiosResponse<MediaListResponse>
  ).data as MediaListResponse;
  yield put(setMediaItems(MediaItems.media ?? []));
}

function* handleUploadMedia(
  action: PayloadAction<{
    requestBody: FormData;
    resolve?: (ids: string[]) => void;
    reject?: (error: unknown) => void;
  }>,
) {
  try {
    const response = (yield call(MediaApiFactory().postUploadMedia, {
      data: action.payload.requestBody,
    })) as AxiosResponse<{ media_id: string }>;
    yield put(setUploadedMediaId([response.data.media_id]));
    yield put({ type: "uploadMediaSuccess" }); // Notify Successful completion (required for creating new Post action)

    // Resolve promise - required for posting message when it contains media
    if (action.payload?.resolve) {
      action.payload.resolve([response.data.media_id]);
    }
  } catch (error) {
    console.error("failed to upload media", error);
    yield put({ type: "uploadMediaFailure" });
    if (action.payload?.reject) {
      action.payload.reject(error);
    }
  }
}

function* handleUploadBulkMedia(
  action: PayloadAction<{
    requestBody: FormData;
    resolve?: (ids: string[]) => void;
    reject?: (error: unknown) => void;
  }>,
) {
  try {
    const response = (yield call(MediaApiFactory().postBulkUploadMedia, {
      data: action.payload.requestBody,
    })) as AxiosResponse<{ ids: string[] }>;
    yield put(setUploadedMediaId(response.data.ids));
    yield put({ type: "uploadBulkMediaSuccess" }); // Notify Successful completion (required for creating new Post action)

    // Resolve promise - required for posting message when it contains media
    if (action.payload?.resolve) {
      action.payload.resolve(response.data.ids);
    }
  } catch (error) {
    console.error("failed to upload bulk media", error);
    yield put({ type: "uploadBulkMediaFailure" });
    if (action.payload?.reject) {
      action.payload.reject(error);
    }
  }
}

export default function* mediaSaga() {
  yield takeEvery(fetchMediaItems.type, handleGetUserMediaItems);
  yield takeEvery(uploadMedia.type, handleUploadMedia);
  yield takeEvery(uploadBulkMedia.type, handleUploadBulkMedia);
}
