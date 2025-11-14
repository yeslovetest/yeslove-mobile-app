import React, { useState } from "react";
import { View, Text, FlatList, Image, Modal, Pressable, StyleSheet } from "react-native";
import { Video } from "expo-av";
import styles from "./PostFilePreviewStyles";
import { MediaFile } from "@/generated-api";
import { BASE_URL } from '@/app/index';

interface FilePreviewProps {
  file: { uri: string; type: string; name?: string }[] | MediaFile[];
}


const PostFilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  if (!file) return null;

  const [modalVisible, setModalVisible] = useState(false);

  const remainingCount = file.length - 2;
  console.log(file);

  const renderFileItem = ({ item }) => (
    <View style={styles.previewContainer}>
      {item.type.startsWith("image") ? (
        <Image source={{ 
          uri: item.uri.startsWith("/api")? `${BASE_URL}${item.uri}` : item.uri
         }} 
         style={styles.previewImage} />
      ) : (
        <Video
          source={{ 
            uri: item.uri.startsWith("/api")? `${BASE_URL}${item.uri}` : item.uri 
          }}
          style={styles.previewVideo}
          useNativeControls
          resizeMode="contain"
        />
      )}
      <Text style={styles.text}> {item.name? `📄${item.name}` : null}</Text>
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
                  {item.type.startsWith("image") ? (
                    <Image
                      source={{ 
                        uri: item.uri.startsWith("/api")? `${BASE_URL}${item.uri}` : item.uri 
                      }}
                      style={[styles.previewImage, { opacity: 0.4 }]}
                    />
                  ) : (
                    <Video
                      source={{ 
                        uri: item.uri.startsWith("/api")? `${BASE_URL}${item.uri}` : item.uri 
                      }}
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



/*
  if (file.at(-1)?.type.startsWith("image")) {
    console.log("Rendering image preview for:", file.uri);
    return <Image source={{ uri: file.uri }} style={styles.previewImage} />;
  }

  if (file.type.startsWith("video")) {
    return (
      <Video
        source={{ uri: file.uri }}
        style={styles.previewVideo}
        useNativeControls
        resizeMode="contain"
      />
    );
  }

  if (file.type.startsWith("audio")) {
    return <Text style={styles.text}>🎵 {file.name || "Audio file selected"}</Text>;
  } **/




export default PostFilePreview;
