import React, { useRef, useState } from 'react'
import { FlatList, Image, Modal, Pressable, Text, useWindowDimensions, View } from 'react-native'
import styles from './MediaContentStyles'
import OneMedium, { resolveMediaUrl } from './Media-components/One-medium/OneMedium'
import {useAppSelector} from '@/app/store/hooks'
import { MediaFile } from '@/generated-api'
import { Video } from '@/app/Universal-components/Video/Video'
import { getImageSource } from '@/constants/imageFallbacks';

const MediaContent = () => {

  const mediaItems = useAppSelector(state => state.media.mediaList);
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const fullScreenListRef = useRef<FlatList<MediaFile> | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const horizontalPadding = 12;
  const columnGap = 8;
  const rowGap = 8;
  const columns = screenWidth >= 980 ? 4 : screenWidth >= 700 ? 3 : 2;
  const measuredWidth = containerWidth > 0 ? containerWidth : Math.max(screenWidth - horizontalPadding * 2, 0);
  const contentWidth = Math.max(measuredWidth - horizontalPadding * 2, 0);
  const tileWidth = Math.max(
    120,
    Math.floor((contentWidth - columnGap * (columns - 1)) / columns)
  );

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setViewerVisible(true);
    setTimeout(() => {
      fullScreenListRef.current?.scrollToIndex({ index, animated: false });
    }, 0);
  };

  return (
    <View
      style={[styles.container, { paddingHorizontal: horizontalPadding }]}
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;
        if (width > 0 && Math.abs(width - containerWidth) > 1) {
          setContainerWidth(width);
        }
      }}
    > 
      {mediaItems.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No media uploaded yet.</Text>
        </View>
      ) : (
        <View style={[styles.gridContainer, { columnGap, rowGap }]}> 
          {mediaItems.map((media, index) => (
            <OneMedium
              media={media}
              key={media?.id ?? `${index}`}
              tileWidth={tileWidth}
              onPress={() => openViewer(index)}
            />
          ))}
        </View>
      )}

      <Modal visible={viewerVisible} animationType="fade" transparent>
        <View style={styles.viewerContainer}>
          <Pressable style={styles.viewerClose} onPress={() => setViewerVisible(false)}>
            <Text style={styles.viewerCloseText}>Close</Text>
          </Pressable>

          <FlatList
            ref={fullScreenListRef}
            data={mediaItems}
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
              const isVideo = item?.content_type?.startsWith('video');
              const mediaUrl = resolveMediaUrl((item as any)?.media_url || item?.url);

              return (
                <View style={[styles.viewerItem, { width: screenWidth }]}>
                  {isVideo ? (
                    <Video
                      source={{ uri: mediaUrl }}
                      style={styles.viewerVideo}
                      useNativeControls
                      resizeMode="contain"
                    />
                  ) : (
                    <Image source={getImageSource(mediaUrl, 'generic')} style={styles.viewerImage} resizeMode="contain" />
                  )}
                </View>
              );
            }}
          />

          <View style={styles.viewerFooter}>
            <Text style={styles.viewerCount}>{currentIndex + 1} / {mediaItems.length}</Text>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default MediaContent
