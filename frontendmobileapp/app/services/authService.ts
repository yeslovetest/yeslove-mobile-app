import axios from "axios";

/**
 * Identity shape returned by the sync/identity endpoints. `keycloak_id` is the
 * stable external-auth identifier for the user (field name is a convention and
 * does not imply a specific auth provider); `user_id` is the local database id.
 */
export type UserIdentityResponse = {
  keycloak_id?: string;
  user_id?: number;
  username?: string;
  email?: string;
};

/**
 * Ensure a local DB user row exists for the authenticated user so protected
 * endpoints that depend on backend user rows work after first login.
 *
 * POST /api/auth/sync_user. Uses the configured global axios instance (baseURL
 * and 401 refresh/retry are applied there).
 */
export const syncUser = async (username: string): Promise<UserIdentityResponse> => {
  const response = await axios.post<UserIdentityResponse>("/api/auth/sync_user", { username });
  return response.data;
};
