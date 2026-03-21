import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

type ResizeMode = 'cover' | 'contain' | 'stretch' | 'none';

type VideoSource = {
  uri: string;
};

interface VideoProps {
  source: VideoSource;
  style?: StyleProp<ViewStyle>;
  useNativeControls?: boolean;
  resizeMode?: ResizeMode | string;
  muted?: boolean;
  isLooping?: boolean;
  shouldPlay?: boolean;
}

const getContentFit = (resizeMode?: ResizeMode | string): 'cover' | 'contain' | 'fill' => {
  if (resizeMode === 'cover') {
    return 'cover';
  }
  if (resizeMode === 'stretch') {
    return 'fill';
  }
  return 'contain';
};

export const Video: React.FC<VideoProps> = ({
  source,
  style,
  useNativeControls = false,
  resizeMode = 'contain',
  muted = false,
  isLooping = false,
  shouldPlay = false,
}) => {
  const player = useVideoPlayer(source.uri, (createdPlayer) => {
    createdPlayer.muted = muted;
    createdPlayer.loop = isLooping;

    if (shouldPlay) {
      createdPlayer.play();
    }
  });

  useEffect(() => {
    player.muted = muted;
    player.loop = isLooping;

    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, muted, isLooping, shouldPlay]);

  return (
    <VideoView
      player={player}
      style={style}
      nativeControls={useNativeControls}
      contentFit={getContentFit(resizeMode)}
    />
  );
};

// Expo Router warns for files inside `app/` without a default export.
export default Video;
