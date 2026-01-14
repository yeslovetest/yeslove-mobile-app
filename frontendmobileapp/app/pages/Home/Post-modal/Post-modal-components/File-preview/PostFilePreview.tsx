import React, { useState, useRef, useEffect } from "react";
import { View, Text, FlatList, Image, Pressable, Dimensions } from "react-native";
import { Video } from "expo-av";
import styles from "./PostFilePreviewStyles";
import { BASE_URL } from '@/app/index';

interface FileItem {
  uri: string;
  type: string;
  name?: string;
  width?: number;
  height?: number;
}

interface Props {
  file: FileItem[];
  editable?: boolean;
  delFunc?: (index: number) => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const MAX_MEDIA_HEIGHT = SCREEN_HEIGHT * 0.7

const PostFilePreview: React.FC<Props> = ({ file, editable, delFunc }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
 
  
  const sliderRef = useRef<FlatList<FileItem>>(null);

  // Compute dynamic aspect ratio 
  const getMediaStyle = (item: FileItem) => {
    if (!containerWidth) return {};

    if (!item.width || !item.height) {
      return {
        width: containerWidth,
        height: containerWidth * 0.75,
      };
    }

    const ratio = item.width / item.height;
    let finalWidth = containerWidth;
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
    if (currentIndex < file.length - 1) {
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
        data={file}
        keyExtractor={(_,index) => index.toString()}
        horizontal
        pagingEnabled
        getItemLayout={(_, index) => ({
            length: containerWidth,
            offset: containerWidth * index,
            index,
          })}
      
        contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}  
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => {
          const isImage = item.type.startsWith("image");
          const uri = item.uri.startsWith("/api") ? `${BASE_URL}${item.uri}` : item.uri;

          return (
            <View style={{ width: '100%', marginRight: 5}}>
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
                  resizeMode="contain"
                />
              )}

              {/* Editable mode navigation arrows */}
              {editable && file.length > 1 && (
                <View style={styles.arrowWrapper}>
                  <Pressable onPress={goPrev} disabled={currentIndex === 0}>
                    <Text
                      style={[
                        styles.arrowText,
                        { opacity: currentIndex === 0 ? 0.2 : 1 },
                      ]}
                    >
                      ◀
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={goNext}
                    disabled={currentIndex === file.length - 1}
                  >
                    <Text
                      style={[
                        styles.arrowText,
                        { opacity: currentIndex === file.length - 1 ? 0.2 : 1 },
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
    </View>
  );
};

export default PostFilePreview;
