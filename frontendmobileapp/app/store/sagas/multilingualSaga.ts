import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { AxiosResponse } from "axios";
import { PayloadAction } from "@reduxjs/toolkit";

import { multilingualApiFactory, MultilingualChatResponse, Persona } from "@/multilingual-client-api/api";
import {
  fetchPersonas,
  fetchPersonasStarted,
  fetchPersonasSucceeded,
  fetchPersonasFailed,
  sendMultilingualMessage,
  sendMultilingualMessageSucceeded,
  sendMultilingualMessageFailed,
} from "../Multilingual/multilingualSlice";
import { getApiMessage } from "./sagaHelpers";
import { appSelect } from "../hooks";

function* handleFetchPersonas() {
  yield put(fetchPersonasStarted());
  try {
    const response = (yield call(multilingualApiFactory.getPersonas)) as AxiosResponse<{
      personas: Persona[];
    }>;
    yield put(fetchPersonasSucceeded(response.data.personas ?? []));
  } catch (error) {
    yield put(fetchPersonasFailed(getApiMessage(error) || "Could not load languages."));
  }
}

function* handleSendMultilingualMessage(action: PayloadAction<{ text: string }>) {
  try {
    const language: string = yield appSelect(
      (state) => state.multilingual.selectedLanguage ?? "eng",
    );
    const sessionId: string | undefined = yield appSelect(
      (state) => state.multilingual.sessionId ?? undefined,
    );

    const response = (yield call(multilingualApiFactory.sendText, {
      message: action.payload.text,
      language,
      session_id: sessionId,
    })) as AxiosResponse<MultilingualChatResponse>;

    yield put(
      sendMultilingualMessageSucceeded({
        botText: response.data.bot_text,
        audioBase64: response.data.audio_base64,
        sessionId: response.data.session_id,
      }),
    );
  } catch (error) {
    yield put(
      sendMultilingualMessageFailed(
        getApiMessage(error) || "Sorry, I could not get a response right now.",
      ),
    );
  }
}

export default function* multilingualSaga() {
  yield takeLatest(fetchPersonas.type, handleFetchPersonas);
  yield takeEvery(sendMultilingualMessage.type, handleSendMultilingualMessage);
}
