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
 * Resolve the authenticated user's identity on backends that do not include it
 * in the login response. Login already creates the local database user.
 *
 * POST /api/profile/user/keycloak_id. Uses the configured global axios instance (baseURL
 * and 401 refresh/retry are applied there).
 */
export const getUserIdentity = async (): Promise<UserIdentityResponse> => {
  const response = await axios.post<UserIdentityResponse>(
    "/api/profile/user/keycloak_id",
    undefined,
    { timeout: 10000 },
  );
  return response.data;
};
