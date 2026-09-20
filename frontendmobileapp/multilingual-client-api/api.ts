import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import { secureGet } from "@/ts/secureStorage";

const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || "").trim();
const BASE_URL = (apiBaseUrl || "http://127.0.0.1:5057").replace(/\/+$/, "");

const apiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1/multilingual`,
});

// Reads the same 'authToken' the token service persists: SecureStore on
// native, localStorage/AsyncStorage on web.
const readAuthToken = (): Promise<string | null> => secureGet("authToken");

apiClient.interceptors.request.use(async (config) => {
  const token = await readAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Persona {
  language: string;
  language_name: string;
  name: string;
  culture_label: string;
}

export interface PersonasResponse {
  personas: Persona[];
}

export interface MultilingualChatResponse {
  session_id: string;
  user_text: string;
  bot_text: string;
  language: string;
  language_name: string;
  detected_language?: string;
  confidence?: number;
  supported?: boolean;
  mode?: string;
  tts_available: boolean;
  audio_chunks_base64: string[];
  audio_base64: string | null;
}

export const multilingualApiFactory = {
  getPersonas: (config?: AxiosRequestConfig) =>
    apiClient.get<PersonasResponse>("/personas", config),

  sendText: (
    data: { message: string; language: string; session_id?: string },
    config?: AxiosRequestConfig,
  ) => apiClient.post<MultilingualChatResponse>("/text", data, config),

  sendVoice: (
    audioUri: string,
    language: string,
    sessionId: string | undefined,
    config?: AxiosRequestConfig,
  ) => {
    const formData = new FormData();
    formData.append("audio", {
      uri: audioUri,
      type: "audio/m4a",
      name: "recording.m4a",
    } as unknown as Blob);
    formData.append("language", language);
    if (sessionId) {
      formData.append("session_id", sessionId);
    }

    return apiClient.post<MultilingualChatResponse>("/voice", formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
