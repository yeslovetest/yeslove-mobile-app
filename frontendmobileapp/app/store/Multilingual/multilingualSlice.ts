import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Persona } from "@/multilingual-client-api/api";

export type MultilingualMessage = {
  role: "user" | "bot";
  text: string;
  createdAt: number;
  audioBase64?: string | null;
};

type MultilingualState = {
  personas: Persona[];
  personasStatus: "idle" | "loading" | "succeeded" | "failed";
  selectedLanguage: string | null;
  sessionId: string | null;
  messages: MultilingualMessage[];
  sending: boolean;
  error: string;
};

const initialState: MultilingualState = {
  personas: [],
  personasStatus: "idle",
  selectedLanguage: null,
  sessionId: null,
  messages: [],
  sending: false,
  error: "",
};

const multilingualSlice = createSlice({
  name: "multilingual",
  initialState,
  reducers: {
    fetchPersonas: () => {},
    fetchPersonasStarted: (state) => {
      state.personasStatus = "loading";
    },
    fetchPersonasSucceeded: (state, action: PayloadAction<Persona[]>) => {
      state.personasStatus = "succeeded";
      state.personas = action.payload;
    },
    fetchPersonasFailed: (state, action: PayloadAction<string>) => {
      state.personasStatus = "failed";
      state.error = action.payload;
    },
    selectPersona: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload;
      state.sessionId = null;
      state.messages = [];
    },
    clearPersona: (state) => {
      state.selectedLanguage = null;
      state.sessionId = null;
      state.messages = [];
    },
    sendMultilingualMessage: (state, action: PayloadAction<{ text: string }>) => {
      state.sending = true;
      state.error = "";
      state.messages.push({
        role: "user",
        text: action.payload.text,
        createdAt: Date.now(),
      });
    },
    sendMultilingualMessageSucceeded: (
      state,
      action: PayloadAction<{ botText: string; audioBase64: string | null; sessionId: string }>,
    ) => {
      state.sending = false;
      state.sessionId = action.payload.sessionId;
      state.messages.push({
        role: "bot",
        text: action.payload.botText,
        createdAt: Date.now(),
        audioBase64: action.payload.audioBase64,
      });
    },
    sendMultilingualMessageFailed: (state, action: PayloadAction<string>) => {
      state.sending = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchPersonas,
  fetchPersonasStarted,
  fetchPersonasSucceeded,
  fetchPersonasFailed,
  selectPersona,
  clearPersona,
  sendMultilingualMessage,
  sendMultilingualMessageSucceeded,
  sendMultilingualMessageFailed,
} = multilingualSlice.actions;

export default multilingualSlice.reducer;
