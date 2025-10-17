import React from "react";
import { View, Image, Text } from "react-native";
import { Video } from "expo-av";
import styles from "./PostFilePreviewStyles";

interface FilePreviewProps {
  file: { uri: string; type: string; name?: string };
}

const PostFilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  if (!file) return null;

  console.log("Rendering file preview for:", file);
  if (file.type.startsWith("image")) {
    console.log("Rendering image preview for:", file.uri);
    return <Image source={{ uri: file.uri }} style={styles.previewImage} />;
  }

  if (file.type.startsWith("video")) {
    return (
      <Video
        source={{ uri: file.uri }}
        style={styles.previewVideo}
        useNativeControls
        resizeMode="cover"
      />
    );
  }

  if (file.type.startsWith("audio")) {
    return <Text style={styles.text}>🎵 {file.name || "Audio file selected"}</Text>;
  }

  return (
    <Text style={styles.text}>📄 {file.name || "File selected"}</Text>
  );
};



export default PostFilePreview;
