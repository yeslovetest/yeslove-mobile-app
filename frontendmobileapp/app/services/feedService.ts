import axios from "axios";

/** A pending incoming friend request. */
export type FriendRequest = {
  keycloak_id: string;
  username: string;
  image?: string;
};

export type FriendRequestsResponse = {
  requests: FriendRequest[];
};

/**
 * Fetch the authenticated user's pending incoming friend requests.
 *
 * GET /api/feed/friend-requests. Uses the configured global axios instance.
 */
export const getFriendRequests = async (): Promise<FriendRequestsResponse> => {
  const response = await axios.get<FriendRequestsResponse>("/api/feed/friend-requests");
  return response.data;
};
