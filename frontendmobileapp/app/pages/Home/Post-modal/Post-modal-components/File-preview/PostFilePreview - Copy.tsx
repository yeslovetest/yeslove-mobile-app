import React, { useState } from "react";
import { View, Text, FlatList, Image, Modal, Pressable, StyleSheet } from "react-native";
import { Video } from "expo-av";
import styles from "./PostFilePreviewStyles";
import { BASE_URL } from '@/app/index';

interface FileItem {
  uri: string;
  type: string;
  name?: string;
}

interface Props {
  file: FileItem[];
  editable?: boolean;
  delFunc?: (index: number) => void;
}

const PostFilePreview: React.FC<Props> = ({ file, editable, delFunc }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const deleteItem = (index: number) => {
    delFunc?.(index);
  };

  const renderFile = ({ item, index }: { item: FileItem, index: number }) => {
    const isImage = item.type.startsWith("image");
    const uri = item.uri.startsWith("/api") ? `${BASE_URL}${item.uri}` : item.uri;

    return (
      <View style={styles.previewContainer}>
        
        {/* DELETE ICON */}
        {editable && (
          <Pressable style={styles.deleteWrapper} onPress={() => deleteItem(index)}>
            <Text style={styles.deleteIcon}>✖</Text>
          </Pressable>
        )}

        {isImage ? (
          <Image source={{ uri }} style={styles.previewImage} />
        ) : (
          <Video
            source={{ uri }}
            style={styles.previewVideo}
            useNativeControls
            resizeMode="contain"
          />
        )}

        {/* FILE NAME */}
        {item.name && (
          <Text numberOfLines={1} style={styles.fileName}>
            📄 {item.name}
          </Text>
        )}
      </View>
    );
  };

  /** Show only first 2, but second one shows +more overlay */
  const remaining = file.length - 2;

  return (
    <View>
      <FlatList
        data={file.slice(0, 2)}
        horizontal
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
          const isLastVisible = index === 1 && remaining > 0;

          if (isLastVisible) {
            const previewUri = item.uri.startsWith("/api")
              ? `${BASE_URL}${item.uri}`
              : item.uri;

            return (
              <Pressable onPress={() => setModalVisible(true)}>
                <View style={styles.previewContainer}>
                  <Image
                    source={{ uri: previewUri }}
                    style={[styles.previewImage, { opacity: 0.4 }]}
                  />
                  <View style={styles.overlay}>
                    <Text style={styles.overlayText}>+{remaining}</Text>
                  </View>
                </View>
              </Pressable>
            );
          }

          return renderFile({ item, index });
        }}
      />

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>All Files</Text>

            <FlatList  
              data={file}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => renderFile({ item, index })}
              numColumns={3}
              contentContainerStyle={{ gap: 10 }}
            />
            

            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PostFilePreview;
