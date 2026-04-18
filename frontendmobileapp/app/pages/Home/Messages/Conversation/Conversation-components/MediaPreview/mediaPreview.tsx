import React, { useMemo, useRef, useState } from "react";
import { View, Text, FlatList, Image, Modal, Pressable, Dimensions } from "react-native";
import { Video } from "@/app/Universal-components/Video/Video";
import styles from "./mediaPreviewStyles";
import { BASE_URL } from "@/app/config/baseUrl";

interface PreviewFile {
  uri?: string;
  type?: string;
  media_url?: string;
  content_type?: string;
  name?: string;
}

type NormalizedMedia = {
  uri: string;
  type: string;
};

interface FilePreviewProps {
  file: PreviewFile[];
  editable?: boolean;
  deleteMedia?: (index: number) => void;
}

const MediaFilePreview: React.FC<FilePreviewProps> = ({ file, editable, deleteMedia }) => {
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullScreenListRef = useRef<FlatList<NormalizedMedia> | null>(null);
  const screenWidth = Dimensions.get("window").width;

  const normalizedMedia = useMemo<NormalizedMedia[]>(() => {
    return (file ?? [])
      .map((item) => {
        const candidate = item?.uri || item?.media_url || "";
        const resolvedUri = candidate.startsWith("/api") ? `${BASE_URL}${candidate}` : candidate;
        const mediaType = item?.type || item?.content_type || "";
        return { uri: resolvedUri, type: mediaType };
      })
      .filter((item) => item.uri.length > 0);
  }, [file]);

  if (normalizedMedia.length === 0) {
    return null;
  }

  const deleteItem = (index: number) => {
    deleteMedia?.(index);
  };

  const openFullScreen = (index: number) => {
    setCurrentIndex(index);
    setFullScreenVisible(true);
    setTimeout(() => {
      fullScreenListRef.current?.scrollToIndex({ index, animated: false });
    }, 0);
  };

  const remainingCount = normalizedMedia.length - 2;

  const renderPreviewItem = (item: NormalizedMedia, index: number) => {
    const isImage = item.type.startsWith("image");

    return (
      <Pressable style={styles.previewContainer} onPress={() => openFullScreen(index)}>
        {editable && (
          <Pressable style={styles.deleteWrapper} onPress={() => deleteItem(index)}>
            <Text style={styles.deleteIcon}>x</Text>
          </Pressable>
        )}

        {isImage ? (
          <Image source={{ uri: item.uri }} style={styles.previewImage} />
        ) : (
          <Video source={{ uri: item.uri }} style={styles.previewVideo} resizeMode="cover" muted />
        )}
      </Pressable>
    );
  };

  return (
    <View>
      <FlatList
        data={normalizedMedia.slice(0, 2)}
        horizontal
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
          const isLastVisible = index === 1 && remainingCount > 0;
          const isImage = item.type.startsWith("image");

          if (isLastVisible) {
            return (
              <Pressable onPress={() => openFullScreen(index)}>
                <View style={styles.previewContainer}>
                  {isImage ? (
                    <Image source={{ uri: item.uri }} style={[styles.previewImage, { opacity: 0.4 }]} />
                  ) : (
                    <Video
                      source={{ uri: item.uri }}
                      style={[styles.previewVideo, { opacity: 0.4 }]}
                      resizeMode="cover"
                      muted
                    />
                  )}
                  <View style={styles.overlay}>
                    <Text style={styles.overlayText}>+{remainingCount}</Text>
                  </View>
                </View>
              </Pressable>
            );
          }

          return renderPreviewItem(item, index);
        }}
      />

      <Modal visible={fullScreenVisible} animationType="fade" transparent>
        <View style={styles.fullScreenContainer}>
          <Pressable style={styles.fullScreenClose} onPress={() => setFullScreenVisible(false)}>
            <Text style={styles.fullScreenCloseText}>Close</Text>
          </Pressable>

          <FlatList
            ref={fullScreenListRef}
            data={normalizedMedia}
            horizontal
            pagingEnabled
            initialScrollIndex={currentIndex}
            keyExtractor={(_, index) => index.toString()}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentIndex(index);
            }}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            renderItem={({ item }) => {
              const isImage = item.type.startsWith("image");
              return (
                <View style={[styles.fullScreenItem, { width: screenWidth }]}> 
                  {isImage ? (
                    <Image source={{ uri: item.uri }} style={styles.fullScreenImage} resizeMode="contain" />
                  ) : (
                    <Video
                      source={{ uri: item.uri }}
                      style={styles.fullScreenVideo}
                      useNativeControls
                      resizeMode="contain"
                    />
                  )}
                </View>
              );
            }}
          />

          <View style={styles.fullScreenFooter}>
            <Text style={styles.fullScreenCounter}>{currentIndex + 1} / {normalizedMedia.length}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MediaFilePreview;