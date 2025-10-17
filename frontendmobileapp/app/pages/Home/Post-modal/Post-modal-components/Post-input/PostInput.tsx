import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Platform, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import styles from "./PostInputStyles";
import PostFilePreview from "../File-preview/PostFilePreview";

interface PostInputProps {
  userPost: string;
  selectedFile: { uri: string; type: string; name?: string } | null;
  setSelectedFile: (file: { uri: string; type: string; name?: string } | null) => void;
  setUserPost: (text: string) => void;

}

const PostInput: React.FC<PostInputProps> = ({ userPost, setUserPost, selectedFile, setSelectedFile }) => {
  //const [selectedFile, setSelectedFile] = useState<{ uri: string; type: string; name?: string } | null>(null);

  const pickFile = async (type: "image" | "video" | "audio" | "pdf") => {
    try {
      if (type === "image") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });
        if (!result.canceled) {
          setSelectedFile({
            uri: result.assets[0].uri,
            type: result.assets[0].type ?? "image/jpeg",
            name: result.assets[0].fileName ?? 'photo.jpg',
          });
        }
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type:
            type === "video"
              ? "video/*"
              : type === "audio"
              ? "audio/*"
              : "application/pdf",
        });

        if (result.assets && result.assets[0]) {
          setSelectedFile({
            uri: result.assets[0].uri,
            type: result.assets[0].mimeType ?? "file",
            name: result.assets[0].name,
          });
        }
      }
    } catch (err) {
      console.error("File picking error:", err);
    }
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

        {/* File preview */}
        {selectedFile && <PostFilePreview file={selectedFile} />}
      </ScrollView>
      

      <View style={styles.postIcons}>
        <TouchableOpacity onPress={() => pickFile("image")}>
          <FontAwesome name="picture-o" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pickFile("video")}>
          <Entypo name="video-camera" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pickFile("audio")}>
          <AntDesign name="sound" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pickFile("pdf")}>
          <Ionicons name="newspaper" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostInput;
