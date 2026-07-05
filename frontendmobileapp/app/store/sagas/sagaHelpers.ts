import axios from "axios";

import dataURLtoFile from "@/utils/mediaUrlConverter";

/**
 * Extract the HTTP status from an unknown error value.
 * Returns undefined when the error is not an Axios error.
 */
export const getHttpStatus = (error: unknown): number | undefined => {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
};

/**
 * Extract an API message from common backend payload shapes.
 * Supports both { message } and { error } response formats.
 */
export const getApiMessage = (error: unknown): string | undefined => {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  const responseData = error.response?.data as { message?: string; error?: string } | undefined;
  return responseData?.message || responseData?.error;
};

/**
 * Normalize picker/media assets into the repeated-file payload the backend
 * expects. `data:` URIs are converted to files; other URIs are passed through as
 * { uri, type, name }. Shared by the feed (new post) and chat (send message)
 * sagas. Returns `any[]` to match the multipart file payload the API clients accept.
 */
export const normalizeMediaFiles = (
  mediaFiles?: { uri: string; type: string; name?: string }[],
): any[] =>
  (mediaFiles ?? [])
    .filter((file) => !!file?.uri && !!file?.type)
    .map((file) => {
      if (file.uri.startsWith("data:")) {
        return dataURLtoFile(
          file.uri,
          file.name ?? (file.type.startsWith("video") ? "video.mp4" : "photo.jpg"),
        );
      }

      return {
        uri: file.uri,
        type: file.type,
        name: file.name ?? (file.type.startsWith("video") ? "video.mp4" : "photo.jpg"),
      };
    });
