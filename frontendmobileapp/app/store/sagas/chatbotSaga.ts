import { put, take, takeLatest } from "redux-saga/effects";
import { eventChannel, END } from "redux-saga";
import { PayloadAction } from "@reduxjs/toolkit";

import {
  ChatResponse as ChatbotApiResponse,
  apiFactory as chatbotApiFactory,
} from "@/chatbot-client-api/api";

import { appSelect } from "../hooks";
import { sendChatbotMessage, setChatbotResponse } from "../Chat/chatSlice";
import { getApiMessage, getHttpStatus } from "./sagaHelpers";

const isStreamAbortError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }

  if (error instanceof Error) {
    return error.name === "AbortError" || error.message === "ask stream aborted";
  }

  return false;
};
function* handleSendChatbotMessage(action: PayloadAction<{ prompt: string }>) {
  const abortController =
    typeof AbortController !== "undefined" ? new AbortController() : undefined;
  try {
    const streamChannel = eventChannel<{
      type: "delta" | "error" | "done";
      text?: string;
      sources?: string[];
      error?: unknown;
    }>((emit) => {
      chatbotApiFactory
        .askQuestionStream(
          { question: action.payload.prompt },
          (partialAnswer) => {
            emit({ type: "delta", text: partialAnswer });
          },
          { signal: abortController?.signal },
        )
        .then((result) => {
          emit({ type: "done", sources: result.sources });
          emit(END);
        })
        .catch((streamError) => {
          emit({ type: "error", error: streamError });
          emit(END);
        });

      return () => {
        abortController?.abort();
      };
    });

    try {
      while (true) {
        const streamEvent: {
          type: "delta" | "error" | "done";
          text?: string;
          sources?: string[];
          error?: unknown;
        } = yield take(streamChannel);

        if (streamEvent.type === "delta") {
          yield put(
            setChatbotResponse({
              response: String(streamEvent.text ?? ""),
              user_id: "",
              session_id: "",
              sources: "",
            } as ChatbotApiResponse),
          );
          continue;
        }

        if (streamEvent.type === "error") {
          throw streamEvent.error;
        }

        if (streamEvent.type === "done") {
          const sourceText = Array.isArray(streamEvent.sources)
            ? streamEvent.sources.join(", ")
            : "";
          const currentResponse = String(
            (yield appSelect((state) => state.chat.chatbotResponse.response)) ?? "",
          );
          yield put(
            setChatbotResponse({
              response: currentResponse,
              user_id: "",
              session_id: "",
              sources: sourceText,
            } as ChatbotApiResponse),
          );
        }

        break;
      }
    } finally {
      streamChannel.close();
    }
  } catch (error) {
    if (isStreamAbortError(error)) {
      return;
    }

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
  // Keep only one chatbot stream active; a new prompt cancels the prior stream.
  yield takeLatest(sendChatbotMessage.type, handleSendChatbotMessage);
}
