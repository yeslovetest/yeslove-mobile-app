import { ImageSourcePropType } from 'react-native';
import { BASE_URL } from '@/app/config/baseUrl';

export const DEFAULT_GENERIC_IMAGE: ImageSourcePropType = require('../assets/images/yeslove-ico.jpg');
export const DEFAULT_PROFILE_IMAGE: ImageSourcePropType = require('../assets/images/default_profile_pic.webp');

type ImageFallbackKind = 'generic' | 'profile';

export const resolveRemoteImageUri = (value?: string, treatBareAsMediaId = false): string => {
  const raw = (value ?? '').trim();

  if (!raw) {
    return '';
  }

  if (/^(data:image\/|https?:\/\/|file:\/\/|content:\/\/)/i.test(raw)) {
    return raw;
  }

  if (raw.startsWith('/')) {
    return `${BASE_URL}${raw}`;
  }

  if (treatBareAsMediaId && !raw.includes('/')) {
    return `${BASE_URL}/api/media/${raw}`;
  }

  if (raw.startsWith('api/')) {
    return `${BASE_URL}/${raw}`;
  }

  // Match post-style resolution for relative paths.
  return `${BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
};

export const getFallbackImageSource = (kind: ImageFallbackKind): ImageSourcePropType => {
  return kind === 'profile' ? DEFAULT_PROFILE_IMAGE : DEFAULT_GENERIC_IMAGE;
};

export const getImageSource = (
  value: string | undefined,
  kind: ImageFallbackKind,
  options?: { treatBareAsMediaId?: boolean }
): ImageSourcePropType => {
  const resolvedUri = resolveRemoteImageUri(value, options?.treatBareAsMediaId ?? false);
  if (!resolvedUri) {
    return getFallbackImageSource(kind);
  }
  return { uri: resolvedUri };
};
