import { all, fork } from "redux-saga/effects";

import authSaga from "./authSaga";
import blogSaga from "./blogSaga";
import chatSaga from "./chatSaga";
import chatbotSaga from "./chatbotSaga";
import eventsSaga from "./eventsSaga";
import feedSaga from "./feedSaga";
import mediaSaga from "./mediaSaga";
import notificationSaga from "./notificationSaga";
import profileSaga from "./profileSaga";

/**
 * Root saga: runs every domain saga concurrently. Each domain saga registers its
 * own takeEvery/takeLatest watchers.
 */
export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(blogSaga),
    fork(chatSaga),
    fork(chatbotSaga),
    fork(eventsSaga),
    fork(feedSaga),
    fork(mediaSaga),
    fork(notificationSaga),
    fork(profileSaga),
  ]);
}
