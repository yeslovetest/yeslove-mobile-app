import { call, put, takeLatest } from "redux-saga/effects";
import { AxiosResponse } from "axios";
import { PayloadAction } from "@reduxjs/toolkit";

import {
  ChatResponse as ChatbotApiResponse,
  apiFactory as chatbotApiFactory,
} from "@/chatbot-client-api/api";

import { sendChatbotMessage, setChatbotResponse } from "../Chat/chatSlice";
import { getApiMessage, getHttpStatus } from "./sagaHelpers";

function* handleSendChatbotMessage(action: PayloadAction<{ prompt: string }>) {
  try {
    const response = (yield call(chatbotApiFactory.sendMessage, {
      message: action.payload.prompt,
    })) as AxiosResponse<ChatbotApiResponse>;

    yield put(setChatbotResponse(response.data));
  } catch (error) {
    console.error("failed to send chatbot response", error);

    const status = getHttpStatus(error);
    const apiMessage = getApiMessage(error);
    const fallbackMessage =
      status === 401
        ? "Your session has expired. Please sign in again to continue chatting."
        : apiMessage || "Sorry, I could not get a response right now. Please try again.";

    yield put(
      setChatbotResponse({
        response: fallbackMessage,
        user_id: "",
        session_id: "",
        sources: "",
      } as ChatbotApiResponse),
    );
  }
}

export default function* chatbotSaga() {
  yield takeLatest(sendChatbotMessage.type, handleSendChatbotMessage);
}
