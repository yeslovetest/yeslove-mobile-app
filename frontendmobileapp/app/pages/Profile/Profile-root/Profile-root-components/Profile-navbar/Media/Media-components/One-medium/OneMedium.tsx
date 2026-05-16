import React from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import { Video } from '@/app/Universal-components/Video/Video';
import styles from './OneMediumStyles'
import { MediaFile } from '@/generated-api';
import { BASE_URL } from '@/app/config/baseUrl';
import { getImageSource } from '@/constants/imageFallbacks';

export interface Props{
    media: MediaFile;
    tileWidth?: number;
  onPress?: () => void;
}

export const resolveMediaUrl = (value?: string): string => {
  const raw = (value ?? '').trim();
  if (!raw) {
    return '';
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  if (raw.startsWith('/api/media/')) {
    return `${BASE_URL}${raw}`;
  }

  if (raw.startsWith('/')) {
    return `${BASE_URL}${raw}`;
  }

  // Allow plain media IDs or relative paths to still resolve correctly.
  return raw.includes('/') ? `${BASE_URL}/${raw}` : `${BASE_URL}/api/media/${raw}`;
};

const OneMedium = (props: Props) => {
  const mediaUrl = resolveMediaUrl((props.media as any)?.media_url || props.media?.url);
  const tileWidth = props.tileWidth ?? 140;
  const tileHeight = Math.round(tileWidth * 0.84);

  if (!mediaUrl) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.mediumContainer, { width: tileWidth, height: tileHeight }]}
      activeOpacity={0.9}
      onPress={props.onPress}
    >
      {props.media?.content_type?.startsWith('image') && (
        <Image source={getImageSource(mediaUrl, 'generic')}
          style={styles.imageMedium}
          resizeMode="contain"
        >
        </Image>
      )}

      {props.media?.content_type?.startsWith('video') && (
        <Video
          source={{ uri: mediaUrl }}
          style={styles.videoMedium}
          useNativeControls
          resizeMode={"contain"}
          shouldPlay={false}
        /> 
      )}
      
    </TouchableOpacity>
  )
}

export default OneMedium
