import { FontAwesome, Entypo, AntDesign, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Platform, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import styles from "./PostInputStyles";
import PostFilePreview from "../File-preview/PostFilePreview";

interface FileItem {
  uri: string;
  type: string;
  name?: string;
}

interface PostInputProps {
  userPost: string;
  selectedFile: FileItem[] | null;
  setSelectedFile: (files: FileItem[] | null) => void;
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

  const pickFile = async (type: "image" | "video" | "audio" | "pdf") => {
    try {
      if (type === "image" || type === "video") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            type === "image"
              ? ImagePicker.MediaTypeOptions.Images
              : ImagePicker.MediaTypeOptions.Videos,
          quality: 1,
        });

        if (!result.canceled) {
          const asset = result.assets[0];
          appendFile({
            uri: asset.uri,
            type: asset.type ?? (type === "image" ? "image/jpeg" : "video/mp4"),
            name: asset.fileName ?? `${type}.${type === "image" ? "jpg" : "mp4"}`
          });
        }
        return;
      }

      // AUDIO OR PDF
      const result = await DocumentPicker.getDocumentAsync({
        type: type === "audio" ? "audio/*" : "application/pdf",
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        appendFile({
          uri: asset.uri,
          type: asset.mimeType ?? "file",
          name: asset.name,
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
    <>
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
          </View>

      {/* ACTION BUTTONS */}
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

    </>
  );
};

export default PostInput;
