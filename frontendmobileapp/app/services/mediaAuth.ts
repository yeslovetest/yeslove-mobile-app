import { useEffect, useState } from "react";

import { BASE_URL } from "@/app/config/baseUrl";
import { secureGet } from "@/ts/secureStorage";

const API_MEDIA_PREFIX = `${BASE_URL}/api/media/`;

/** True for files served by our own API, which may be private (chat attachments). */
export const isApiMediaUri = (uri: string): boolean => uri.startsWith(API_MEDIA_PREFIX);

/** Authorization header for our API media, or undefined for any other address. */
export const getMediaHeaders = (
  uri: string,
  token: string | null | undefined,
): Record<string, string> | undefined =>
  token && isApiMediaUri(uri) ? { Authorization: `Bearer ${token}` } : undefined;

/**
 * The signed-in member's access token. `loaded` is false until it has been read, so callers
 * can wait instead of requesting a private file without credentials.
 */
export const useMediaAuthToken = (): { token: string | null; loaded: boolean } => {
  const [state, setState] = useState<{ token: string | null; loaded: boolean }>({
    token: null,
    loaded: false,
  });

  useEffect(() => {
    let cancelled = false;
    secureGet("authToken")
      .then((value) => !cancelled && setState({ token: value, loaded: true }))
      .catch(() => !cancelled && setState({ token: null, loaded: true }));
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
