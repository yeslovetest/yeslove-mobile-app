import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import { secureGet } from "@/ts/secureStorage";

const chatbotBaseUrl = (process.env.EXPO_PUBLIC_CHATBOT_BASE_URL || "").trim();
const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || "").trim();
const BASE_URL = (chatbotBaseUrl || apiBaseUrl || "http://127.0.0.1:8000").replace(/\/+$/, "");

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Reads the same 'authToken' the token service persists: SecureStore on native,
// localStorage/AsyncStorage on web.
const readAuthToken = (): Promise<string | null> => secureGet("authToken");

// Add authorization interceptor
apiClient.interceptors.request.use(async (config) => {
  const token = await readAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ChatRequest {
  message: string;
  session_id?: string;
  user_id?: number;
  history?: object[];
}

export interface ChatResponse {
  response: string;
  session_id: string;
  user_id: string;
  sources: string;
}

export interface SyncResponse {
  status: string;
}

export interface PostSyncRequest {
  posts: object[];
  action?: string;
}

export interface MigrateRequest {
  documents: object[];
}

export interface AskRequest {
  question: string;
}

export interface AskResponse {
  answer: string;
  sources?: string[];
  cache_creation_tokens?: number;
  cache_read_tokens?: number;
}

type AskStreamEvent = {
  type?: string;
  text?: string;
  sources?: string[];
  error?: string;
};

type AskStreamOptions = {
  signal?: AbortSignal;
};

export const apiFactory = {
  // Anthropic crawl API
  askQuestion: (data: AskRequest, config?: AxiosRequestConfig) =>
    apiClient.post<AskResponse>("/ask", data, config),

  askQuestionStream: async (
    data: AskRequest,
    onPartialAnswer: (partialAnswer: string) => void,
    options?: AskStreamOptions,
  ): Promise<AskResponse> => {
    const token = await readAuthToken();
    const signal = options?.signal;

    if (signal?.aborted) {
      throw new Error("ask stream aborted");
    }

    let answer = "";
    let sources: string[] = [];

    const processEvent = (rawEvent: string) => {
      const payloadRaw = rawEvent
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");

      if (!payloadRaw) {
        return;
      }

      const payload = JSON.parse(payloadRaw) as AskStreamEvent;

      if (payload.type === "error") {
        throw new Error(payload.error || "ask stream returned an error event");
      }

      if (payload.type === "delta" && typeof payload.text === "string") {
        answer += payload.text;
        onPartialAnswer(answer);
      }

      if (payload.type === "done" && Array.isArray(payload.sources)) {
        sources = payload.sources.map((item) => String(item ?? "").trim()).filter(Boolean);
      }
    };

    if (typeof XMLHttpRequest !== "undefined") {
      return new Promise<AskResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let processedLength = 0;
        let buffer = "";
        let settled = false;

        const abortRequest = () => {
          if (settled) {
            return;
          }
          settled = true;
          try {
            xhr.abort();
          } catch {
            // Ignore abort errors.
          }
          reject(new Error("ask stream aborted"));
        };

        const fail = (error: unknown) => {
          if (settled) {
            return;
          }
          settled = true;
          reject(error instanceof Error ? error : new Error(String(error)));
        };

        const flushBuffer = () => {
          let separatorIndex = buffer.indexOf("\n\n");
          while (separatorIndex !== -1) {
            const rawEvent = buffer.slice(0, separatorIndex);
            buffer = buffer.slice(separatorIndex + 2);
            processEvent(rawEvent);
            separatorIndex = buffer.indexOf("\n\n");
          }
        };

        xhr.open("POST", `${BASE_URL}/ask`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "text/event-stream");
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        if (signal) {
          if (signal.aborted) {
            abortRequest();
            return;
          }
          signal.addEventListener("abort", abortRequest, { once: true });
        }

        xhr.onprogress = () => {
          try {
            const nextChunk = xhr.responseText.slice(processedLength);
            processedLength = xhr.responseText.length;
            if (!nextChunk) {
              return;
            }

            buffer += nextChunk.replace(/\r\n/g, "\n");
            flushBuffer();
          } catch (error) {
            fail(error);
          }
        };

        xhr.onerror = () => {
          fail(new Error("ask stream network error"));
        };

        xhr.onreadystatechange = () => {
          if (xhr.readyState !== 4 || settled) {
            return;
          }

          if (xhr.status < 200 || xhr.status >= 300) {
            fail(new Error(xhr.responseText || `ask stream failed with status ${xhr.status}`));
            return;
          }

          try {
            const trailingChunk = xhr.responseText.slice(processedLength);
            processedLength = xhr.responseText.length;
            if (trailingChunk) {
              buffer += trailingChunk.replace(/\r\n/g, "\n");
            }
            if (buffer.trim()) {
              processEvent(buffer);
            }
            settled = true;
            if (signal) {
              signal.removeEventListener("abort", abortRequest);
            }
            resolve({ answer, sources });
          } catch (error) {
            fail(error);
          }
        };

        xhr.send(JSON.stringify(data));
      });
    }

    const response = await fetch(`${BASE_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `ask stream failed with status ${response.status}`);
    }

    if (!response.body) {
      // React Native fetch may not expose ReadableStream; parse the SSE payload at once.
      const fullText = (await response.text()).replace(/\r\n/g, "\n");
      const events = fullText.split("\n\n");
      for (const rawEvent of events) {
        if (rawEvent.trim()) {
          processEvent(rawEvent);
        }
      }
      return { answer, sources };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let separatorIndex = buffer.indexOf("\n\n");
      while (separatorIndex !== -1) {
        const rawEvent = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + 2);
        processEvent(rawEvent);
        separatorIndex = buffer.indexOf("\n\n");
      }
    }

    if (buffer.trim()) {
      processEvent(buffer);
    }

    return { answer, sources };
  },

  // Chat API
  sendMessage: (data: ChatRequest, config?: AxiosRequestConfig) =>
    apiClient.post<ChatResponse>("/api/v1/chat/message", data, config),

  // Sync API
  syncBlogs: (data: PostSyncRequest, config?: AxiosRequestConfig) =>
    apiClient.post<SyncResponse>("/api/v1/sync/blogs", data, config),

  // Admin API
  startAutoSync: (config?: AxiosRequestConfig) =>
    apiClient.post<SyncResponse>("/api/v1/admin/sync/start", {}, config),

  stopAutoSync: (config?: AxiosRequestConfig) =>
    apiClient.post<SyncResponse>("/api/v1/admin/sync/stop", {}, config),

  triggerSync: (config?: AxiosRequestConfig) =>
    apiClient.post<SyncResponse>("/api/v1/admin/sync/trigger", {}, config),

  // Migration API
  migrateDocuments: (data: MigrateRequest, config?: AxiosRequestConfig) =>
    apiClient.post("/api/v1/migrate/documents", data, config),

  // Health Check
  healthCheck: (config?: AxiosRequestConfig) => apiClient.get("/api/v1/health", config),
};

export default apiFactory;
