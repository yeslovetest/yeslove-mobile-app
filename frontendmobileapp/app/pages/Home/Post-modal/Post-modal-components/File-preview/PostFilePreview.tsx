import React, { useState, useRef, useEffect } from "react";
import { View, Text, FlatList, Image, Pressable, Dimensions } from "react-native";
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
}

interface Props {
  file: Array<FileItem | MediaFile>;
  editable?: boolean;
  delFunc?: (index: number) => void;
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
    };
  }

  return {
    uri: input.url ?? '',
    type: input.content_type ?? 'image/jpeg',
    name: input.filename,
  };
};

const PostFilePreview: React.FC<Props> = ({ file, editable, delFunc }) => {
  const normalizedFiles = file.map(normalizeFileItem).filter((item) => !!item.uri && !!item.type);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const itemGap = 10;
  const cardWidth = normalizedFiles.length > 1 ? containerWidth * 0.9 : containerWidth;
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

  // Compute dynamic aspect ratio 
  const getMediaStyle = (item: FileItem) => {
    if (!cardWidth) return {};

    if (!item.width || !item.height) {
      return {
        width: cardWidth,
        height: Math.min(cardWidth * 1.1, MAX_MEDIA_HEIGHT),
      };
    }

    const ratio = item.width / item.height;
    let finalWidth = cardWidth;
    let finalHeight = finalWidth / ratio;

    // Cap height
    if (finalHeight > MAX_MEDIA_HEIGHT) {
      finalHeight = MAX_MEDIA_HEIGHT;
      finalWidth = finalHeight * ratio;
    }

    return { width: finalWidth, height: finalHeight };
  };

  const scrollToIndex = (index: number) => {
    sliderRef.current?.scrollToIndex({ index, animated: true });
  };

  const goNext = () => {
    if (currentIndex < normalizedFiles.length - 1) {
      scrollToIndex(currentIndex + 1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
      setCurrentIndex(currentIndex - 1);
    }
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
        decelerationRate="fast"
        snapToInterval={itemSnapSize}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingRight: normalizedFiles.length > 1 ? itemGap : 0,
        }}
        onScrollToIndexFailed={(info) => {
          sliderRef.current?.scrollToOffset({
            offset: info.index * itemSnapSize,
            animated: true,
          });
        }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / itemSnapSize);
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => {
          const isImage = item.type.startsWith("image");
          const uri = /^(https?:\/\/|file:|data:)/i.test(item.uri)
            ? item.uri
            : `${BASE_URL}${item.uri.startsWith('/') ? '' : '/'}${item.uri}`;

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
                  style={{ ...getMediaStyle(item), borderRadius: 10}}
                  resizeMode="cover"
                />
              ) : (
                <Video
                  source={{ uri }}
                  style={{ ...getMediaStyle(item), borderRadius: 10 }}
                  useNativeControls
                  resizeMode="cover"
                />
              )}

              {normalizedFiles.length > 1 && (
                <View style={styles.arrowWrapper}>
                  <Pressable
                    style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
                    onPress={goPrev}
                    disabled={currentIndex === 0}
                  >
                    <Text
                      style={[
                        styles.navButtonText,
                        { opacity: currentIndex === 0 ? 0.4 : 1 },
                      ]}
                    >
                      ◀
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[styles.navButton, currentIndex === normalizedFiles.length - 1 && styles.navButtonDisabled]}
                    onPress={goNext}
                    disabled={currentIndex === normalizedFiles.length - 1}
                  >
                    <Text
                      style={[
                        styles.navButtonText,
                        { opacity: currentIndex === normalizedFiles.length - 1 ? 0.4 : 1 },
                      ]}
                    >
                      ▶
                    </Text>
                  </Pressable>
                </View>
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
