import React, { useState } from "react";
import { View, Text, FlatList, Image, Modal, Pressable, StyleSheet } from "react-native";
import { Video } from "expo-av";
import styles from "./mediaPreviewStyles";

interface FilePreviewProps {
  file: { uri?: string, type?: string, media_url?: string, name?: string }[];
}


const MediaFilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  if (!file) return null;

  const [modalVisible, setModalVisible] = useState(false);
   
  const remainingCount = file.length - 2;

  const renderFileItem = ({ item }) => (
    <View style={styles.previewContainer}>
      {item.type.startsWith("image") ? (
        <Image source={{ uri: item.uri || item.media_url }} style={styles.previewImage} />
      ) : (
        <Video
          source={{ uri: item.uri || item.media_url  }}
          style={styles.previewVideo}
          useNativeControls
          resizeMode="contain"
        />
      )}
    </View>
  );

  return (
    <View>
      <FlatList
        data={file.slice(0, 2)}
        horizontal
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
          const isLastVisible = index === 1 && remainingCount > 0;

          if (isLastVisible) {
            return (
              <Pressable onPress={() => setModalVisible(true)}>
                <View style={styles.previewContainer}>
                  {item?.type.startsWith("image") ? (
                    <Image
                      source={{ uri: item.uri || item.media_url  }}
                      style={[styles.previewImage, { opacity: 0.4 }]}
                    />
                  ) : (
                    <Video
                      source={{ uri: item.uri || item.media_url  }}
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

          // Normal first item
          return renderFileItem({ item });
        }}
      />

      {/* Modal to show all files */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>All Files</Text>

            <FlatList
              data={file}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderFileItem}
              numColumns={2}
              contentContainerStyle={{ gap: 10 }}
            />

            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}



export default MediaFilePreview;
