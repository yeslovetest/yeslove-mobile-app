import axios, { AxiosRequestConfig } from "axios";

// Uses the global axios instance, which already carries the base URL, the auth
// header and the refresh-on-401 handling set up in app/config/httpClient.ts.

export type ReportContentType = "post" | "comment" | "message" | "user";

export type ReportReason =
  | "harassment"
  | "hate"
  | "sexual"
  | "violence"
  | "self_harm"
  | "spam"
  | "impersonation"
  | "other";

export interface ReportRequest {
  content_type: ReportContentType;
  content_id?: number;
  // For user reports, identify the user by Keycloak id instead of content_id.
  user_keycloak_id?: string;
  reason: ReportReason;
  details?: string;
}

export interface BlockedUser {
  id: string;
  username: string;
  profile_pic?: string | null;
  blocked_at?: string | null;
}

export const safetyApiFactory = {
  report: (data: ReportRequest, config?: AxiosRequestConfig) =>
    axios.post<{ message: string; report_id?: number }>("/api/safety/report", data, config),

  blockUser: (keycloakId: string, config?: AxiosRequestConfig) =>
    axios.post<{ message: string }>(`/api/safety/block/${encodeURIComponent(keycloakId)}`, {}, config),

  unblockUser: (keycloakId: string, config?: AxiosRequestConfig) =>
    axios.delete<{ message: string }>(`/api/safety/block/${encodeURIComponent(keycloakId)}`, config),

  listBlocked: (config?: AxiosRequestConfig) =>
    axios.get<{ blocked: BlockedUser[] }>("/api/safety/blocks", config),
};
