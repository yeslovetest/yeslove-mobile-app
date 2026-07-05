import React, { useMemo, useRef, useState } from "react";
import { View, Text, FlatList, Image, Modal, Pressable, Dimensions } from "react-native";
import { Video } from "@/app/Universal-components/Video/Video";
import styles from "./mediaPreviewStyles";
import { theme } from "@/app/theme";
import { BASE_URL } from "@/app/config/baseUrl";
import { getImageSource } from "@/constants/imageFallbacks";

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
  bubbleTone?: "sent" | "received";
  maxPreviewWidth?: number;
}

const MediaFilePreview: React.FC<FilePreviewProps> = ({
  file,
  editable,
  deleteMedia,
  bubbleTone = "sent",
  maxPreviewWidth,
}) => {
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullScreenListRef = useRef<FlatList<NormalizedMedia> | null>(null);
  const screenWidth = Dimensions.get("window").width;
  const isTablet = screenWidth >= 768;
  const railItemSize = isTablet ? 132 : 108;
  const sizeMultiplier = bubbleTone === "received" ? 0.92 : 1;
  const previewWidth = Math.min(
    Math.max(screenWidth * 0.58 * sizeMultiplier, bubbleTone === "received" ? 164 : 176),
    bubbleTone === "received" ? 226 : 244,
    maxPreviewWidth ?? Number.POSITIVE_INFINITY,
  );
  const previewHeight = Math.round(previewWidth * 0.74);

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

  const firstItem = normalizedMedia[0];
  const remainingCount = normalizedMedia.length - 1;
  const isFirstImage = firstItem.type.startsWith("image");

  if (editable) {
    return (
      <View style={{ width: "100%" }}>
        <FlatList
          data={normalizedMedia}
          horizontal
          keyExtractor={(_, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 2, paddingRight: 4, gap: 8 }}
          renderItem={({ item, index }) => {
            const isImage = item.type.startsWith("image");
            return (
              <Pressable
                style={{
                  position: "relative",
                  width: railItemSize,
                  height: railItemSize,
                  borderRadius: 14,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: "#0f172a",
                }}
                onPress={() => openFullScreen(index)}
              >
                <Pressable style={styles.deleteWrapper} onPress={() => deleteItem(index)}>
                  <Text style={styles.deleteIcon}>x</Text>
                </Pressable>

                {isImage ? (
                  <Image
                    source={getImageSource(item.uri, "generic")}
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: theme.colors.surfaceAlt,
                    }}
                    resizeMode="contain"
                  />
                ) : (
                  <Video
                    source={{ uri: item.uri }}
                    style={{ width: "100%", height: "100%", backgroundColor: "#0f172a" }}
                    resizeMode="contain"
                    muted
                  />
                )}
              </Pressable>
            );
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
                      <Image
                        source={getImageSource(item.uri, "generic")}
                        style={styles.fullScreenImage}
                        resizeMode="contain"
                      />
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
              <Text style={styles.fullScreenCounter}>
                {currentIndex + 1} / {normalizedMedia.length}
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View>
      <Pressable style={styles.previewContainer} onPress={() => openFullScreen(0)}>
        {editable && (
          <Pressable style={styles.deleteWrapper} onPress={() => deleteItem(0)}>
            <Text style={styles.deleteIcon}>x</Text>
          </Pressable>
        )}

        {isFirstImage ? (
          <Image
            source={getImageSource(firstItem.uri, "generic")}
            style={[styles.previewImage, { width: previewWidth, height: previewHeight }]}
            resizeMode="cover"
          />
        ) : (
          <Video
            source={{ uri: firstItem.uri }}
            style={[styles.previewVideo, { width: previewWidth, height: previewHeight }]}
            resizeMode="cover"
            muted
          />
        )}
      </Pressable>

      {remainingCount > 0 && (
        <Pressable
          style={[
            styles.moreChip,
            bubbleTone === "received" ? styles.moreChipReceived : styles.moreChipSent,
          ]}
          onPress={() => openFullScreen(0)}
        >
          <Text
            style={[
              styles.moreChipText,
              bubbleTone === "received" ? styles.moreChipTextReceived : styles.moreChipTextSent,
            ]}
          >
            +{remainingCount} more
          </Text>
        </Pressable>
      )}

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
                    <Image
                      source={getImageSource(item.uri, "generic")}
                      style={styles.fullScreenImage}
                      resizeMode="contain"
                    />
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
            <Text style={styles.fullScreenCounter}>
              {currentIndex + 1} / {normalizedMedia.length}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MediaFilePreview;
