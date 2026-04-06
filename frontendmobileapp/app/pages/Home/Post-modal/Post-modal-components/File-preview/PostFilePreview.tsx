import React, { useState, useRef, useEffect } from "react";
import { View, Text, FlatList, Image, Pressable, Dimensions, useWindowDimensions } from "react-native";
import { Video } from '@/app/Universal-components/Video/Video';
import styles from "./PostFilePreviewStyles";
import { BASE_URL } from '@/app/config/baseUrl';
import { MediaFile } from '@/generated-api';

interface FileItem {
  uri: string;
  type: string;
  name?: string;
  width?: number;
  height?: number;
  fileSize?: number;
}

interface Props {
  file: Array<FileItem | MediaFile>;
  editable?: boolean;
  delFunc?: (index: number) => void;
  showNextPreview?: boolean;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const MAX_MEDIA_HEIGHT = SCREEN_HEIGHT * 0.56;

const normalizeFileItem = (input: FileItem | MediaFile): FileItem => {
  if ('uri' in input && 'type' in input) {
    return {
      uri: input.uri,
      type: input.type,
      name: input.name,
      width: input.width,
      height: input.height,
      fileSize: input.fileSize,
    };
  }

  return {
    uri: input.url ?? '',
    type: input.content_type ?? 'image/jpeg',
    name: input.filename,
  };
};

const PostFilePreview: React.FC<Props> = ({ file, editable, delFunc, showNextPreview = false }) => {
  const { width: screenWidth } = useWindowDimensions();
  const normalizedFiles = file.map(normalizeFileItem).filter((item) => !!item.uri && !!item.type);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const hasMultipleMedia = normalizedFiles.length > 1;
  const shouldShowPeek = showNextPreview && hasMultipleMedia;
  const previewPeekWidth = shouldShowPeek
    ? Math.min(Math.max(screenWidth * 0.08, 18), 36)
    : 0;
  const itemGap = shouldShowPeek
    ? Math.min(Math.max(screenWidth * 0.02, 6), 12)
    : 0;
  const cardWidth = shouldShowPeek
    ? Math.max(containerWidth - previewPeekWidth, 0)
    : containerWidth;
  const itemSnapSize = cardWidth + itemGap;
 
  
  const sliderRef = useRef<FlatList<FileItem>>(null);

  useEffect(() => {
    if (!normalizedFiles.length) {
      setCurrentIndex(0);
      return;
    }

    const nextIndex = editable ? normalizedFiles.length - 1 : 0;
    setCurrentIndex(nextIndex);

    if (containerWidth > 0) {
      setTimeout(() => {
        sliderRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }, 0);
    }
  }, [editable, normalizedFiles.length, containerWidth]);

  // Keep media full-width with natural aspect ratio; only crop when height exceeds max.
  const getMediaPresentation = (item: FileItem) => {
    if (!cardWidth) {
      return {
        style: {},
        resizeMode: "cover" as const,
      };
    }

    if (!item.width || !item.height) {
      return {
        style: {
          width: cardWidth,
          height: Math.min(cardWidth, MAX_MEDIA_HEIGHT),
        },
        resizeMode: "cover" as const,
      };
    }

    const naturalHeight = cardWidth * (item.height / item.width);
    const cappedHeight = Math.min(naturalHeight, MAX_MEDIA_HEIGHT);
    const shouldCrop = naturalHeight > MAX_MEDIA_HEIGHT;

    return {
      style: {
        width: cardWidth,
        height: cappedHeight,
      },
      resizeMode: shouldCrop ? ("cover" as const) : ("contain" as const),
    };
  };

  return (
    <View style={{backgroundColor: 'white', width: '100%' }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <FlatList
        ref={sliderRef}
        data={normalizedFiles}
        keyExtractor={(_,index) => index.toString()}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={itemSnapSize}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: shouldShowPeek ? 2 : 0,
          paddingRight: normalizedFiles.length > 1 ? itemGap : 0,
        }}
        onScrollToIndexFailed={(info) => {
          sliderRef.current?.scrollToOffset({
            offset: info.index * itemSnapSize,
            animated: true,
          });
        }}
        onMomentumScrollEnd={(e) => {
          const index = itemSnapSize > 0
            ? Math.round(e.nativeEvent.contentOffset.x / itemSnapSize)
            : 0;
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => {
          const isImage = item.type.startsWith("image");
          const uri = /^(https?:\/\/|file:|data:)/i.test(item.uri)
            ? item.uri
            : `${BASE_URL}${item.uri.startsWith('/') ? '' : '/'}${item.uri}`;
          const mediaPresentation = getMediaPresentation(item);

          return (
            <View style={{ width: cardWidth || '100%', marginRight: normalizedFiles.length > 1 ? itemGap : 0 }}>
              {editable && (
                <Pressable
                  style={styles.deleteWrapper}
                  onPress={() => delFunc?.(index)}
                >
                  <Text style={styles.deleteIcon}>✖</Text>
                </Pressable>
              )}

              {isImage ? (
                <Image
                  source={{ uri }}
                  style={{ ...mediaPresentation.style, borderRadius: 10}}
                  resizeMode={mediaPresentation.resizeMode}
                />
              ) : (
                <Video
                  source={{ uri }}
                  style={{ ...mediaPresentation.style, borderRadius: 10 }}
                  useNativeControls
                  resizeMode={mediaPresentation.resizeMode}
                />
              )}
            </View>
          );
        }}
      />

      {normalizedFiles.length > 1 && (
        <View style={styles.dotsContainer}>
          {normalizedFiles.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[styles.dot, index === currentIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default PostFilePreview;
