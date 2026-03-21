import { FontAwesome, Entypo, Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import styles from "./PostInputStyles";
import PostFilePreview from "../File-preview/PostFilePreview";

interface FileItem {
  uri: string;
  type: string;
  name?: string;
  width?: number;
  height?: number;
}

interface PostInputProps {
  userPost: string;
  selectedFile: FileItem[] | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileItem[] | null>>;
  setUserPost: (text: string) => void;
}

const PostInput: React.FC<PostInputProps> = ({
  userPost,
  setUserPost,
  selectedFile,
  setSelectedFile,
}) => {
  
  const appendFile = (file: FileItem) => {
    setSelectedFile((prev) => [...(prev || []), file]);
  };

  const pickFile = async (type: "image" | "video") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          type === "image"
            ? ImagePicker.MediaTypeOptions.Images
            : ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length) {
        result.assets.forEach((asset) => {
          appendFile({
            uri: asset.uri,
            type: asset.type === "video" ? "video/mp4" : "image/jpeg",
            name: asset.fileName ?? `${type}.${type === "image" ? "jpg" : "mp4"}`,
            width: asset.width,
            height: asset.height,
          });
        });
      }
    } catch (err) {
      console.error("File picking error:", err);
    }
  };

  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length) {
        result.assets.forEach((asset) => {
          // Keep feature scope limited to image and video for now.
          if (asset.type !== "image" && asset.type !== "video") return;

        appendFile({
          uri: asset.uri,
            type: asset.type === "video" ? "video/mp4" : "image/jpeg",
            name:
              asset.fileName ??
              (asset.type === "video" ? "video.mp4" : "photo.jpg"),
            width: asset.width,
            height: asset.height,
        });
        });
      }
    } catch (err) {
      console.error("File picking error:", err);
    }
  };

  const deleteSelectedFile = (index: number) => {
    setSelectedFile(prev => {
      if (!prev) return prev;
      const copy = [...prev];
      copy.splice(index, 1);     
      return copy;
    });
  };

  return (
    <View style={styles.userPostBoxContainer}>
      <ScrollView>
        <TextInput
          value={userPost}
          onChangeText={setUserPost}
          style={styles.postInput}
          multiline
          placeholder="Share what you're thinking..."
          placeholderTextColor="gray"
        />

        {selectedFile && selectedFile.length > 0 && (
          <PostFilePreview
            file={selectedFile}
            editable
            delFunc={deleteSelectedFile}
          />
        )}
      </ScrollView>

      {/* ACTION BUTTONS */}
      <View style={styles.postIcons}>
        <TouchableOpacity style={styles.mediaActionButton} onPress={pickMedia}>
          <FontAwesome name="picture-o" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.mediaActionButton} onPress={() => pickFile("video")}>
          <Entypo name="video-camera" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.mediaActionButton} onPress={() => pickFile("image")}>
          <Ionicons name="images-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostInput;
