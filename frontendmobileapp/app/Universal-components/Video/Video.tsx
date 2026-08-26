import React, { useEffect, useState } from "react";
import { Image, Platform, StyleProp, View, ViewStyle } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as VideoThumbnails from "expo-video-thumbnails";
import styles from "./VideoStyles";
import { theme } from "@/app/theme";
import { getImageSource } from "@/constants/imageFallbacks";

type ResizeMode = "cover" | "contain" | "stretch" | "none";

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

const getContentFit = (resizeMode?: ResizeMode | string): "cover" | "contain" | "fill" => {
  if (resizeMode === "cover") {
    return "cover";
  }
  if (resizeMode === "stretch") {
    return "fill";
  }
  return "contain";
};

const getImageResizeMode = (resizeMode?: ResizeMode | string): "cover" | "contain" | "stretch" => {
  if (resizeMode === "cover") {
    return "cover";
  }
  if (resizeMode === "stretch") {
    return "stretch";
  }
  return "contain";
};

export const Video: React.FC<VideoProps> = ({
  source,
  style,
  useNativeControls = false,
  resizeMode = "contain",
  muted = false,
  isLooping = false,
  shouldPlay = false,
}) => {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [hasFirstFrameRendered, setHasFirstFrameRendered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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

  useEffect(() => {
    setIsPlaying(player.playing);

    const subscription = player.addListener("playingChange", ({ isPlaying: nextIsPlaying }) => {
      setIsPlaying(nextIsPlaying);
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  useEffect(() => {
    setHasFirstFrameRendered(false);

    if (!source.uri) {
      setThumbnailUri(null);
      return;
    }

    let isCancelled = false;

    VideoThumbnails.getThumbnailAsync(source.uri, {
      time: 1000,
      quality: 0.6,
    })
      .then((result) => {
        if (!isCancelled) {
          setThumbnailUri(result.uri);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setThumbnailUri(null);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [source.uri]);

  return (
    <View style={[style, styles.container]}>
      <VideoView
        player={player}
        style={styles.mediaFill}
        nativeControls={useNativeControls}
        contentFit={getContentFit(resizeMode)}
        // Texture rendering is more stable for inline Android playback in lists/cards.
        surfaceType={Platform.OS === "android" ? "textureView" : undefined}
        useExoShutter={false}
        onFirstFrameRender={() => setHasFirstFrameRendered(true)}
      />

      {!!thumbnailUri && !hasFirstFrameRendered && (
        <Image
          source={getImageSource(thumbnailUri, "generic")}
          style={styles.mediaFill}
          resizeMode={getImageResizeMode(resizeMode)}
        />
      )}

      {!isPlaying && (
        <View style={styles.playIconWrap} pointerEvents="none">
          <View style={styles.playIconBadge}>
            <Ionicons
              name="play"
              size={12}
              color={theme.colors.textOnPrimary}
              style={styles.playIcon}
            />
          </View>
        </View>
      )}
    </View>
  );
};

// Expo Router warns for files inside `app/` without a default export.
export default Video;
