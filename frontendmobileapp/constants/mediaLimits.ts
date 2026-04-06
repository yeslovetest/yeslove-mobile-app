export const MEDIA_UPLOAD_LIMITS = {
  postMediaFileMaxBytes: 3 * 1024 * 1024,
  profileImageMaxBytes: 2 * 1024 * 1024,
  chatMediaFileMaxBytes: 2 * 1024 * 1024,
} as const;

export const formatSizeMb = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)}MB`;
};