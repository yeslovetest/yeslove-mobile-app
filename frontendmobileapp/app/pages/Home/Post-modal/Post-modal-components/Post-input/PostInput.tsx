import { FontAwesome, Entypo, Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
// SDK 54 moved getInfoAsync to the legacy API; the new File/Directory API lives at
// the package root. Keep the legacy import until this is migrated in a later phase.
import * as FileSystem from "expo-file-system/legacy";
import styles from "./PostInputStyles";
import { theme } from "@/app/theme";
import PostFilePreview from "../File-preview/PostFilePreview";
import { MEDIA_UPLOAD_LIMITS, formatSizeMb } from "@/constants/mediaLimits";

interface FileItem {
  uri: string;
  type: string;
  name?: string;
  width?: number;
  height?: number;
  fileSize?: number;
}

interface PostInputProps {
  userPost: string;
  selectedFile: FileItem[] | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileItem[] | null>>;
  setUserPost: (text: string) => void;
  validationMessage: string;
  setValidationMessage: (message: string) => void;
}

const PostInput: React.FC<PostInputProps> = ({
  userPost,
  setUserPost,
  selectedFile,
  setSelectedFile,
  validationMessage,
  setValidationMessage,
}) => {
  const getAssetFileSize = async (
    asset: ImagePicker.ImagePickerAsset,
  ): Promise<number | undefined> => {
    if (asset.fileSize) {
      return asset.fileSize;
    }

    try {
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      if (fileInfo.exists && typeof (fileInfo as any).size === "number") {
        return (fileInfo as any).size;
      }
    } catch {
      // Ignore size read failure and proceed without strict size metadata.
    }

    return undefined;
  };

  const appendAssetIfValid = async (
    asset: ImagePicker.ImagePickerAsset,
    fallbackType: "image" | "video",
  ) => {
    if (asset.type !== "image" && asset.type !== "video") return;

    const fileSize = await getAssetFileSize(asset);
    if (typeof fileSize === "number" && fileSize > MEDIA_UPLOAD_LIMITS.postMediaFileMaxBytes) {
      setValidationMessage(
        `Media must be ${formatSizeMb(MEDIA_UPLOAD_LIMITS.postMediaFileMaxBytes)} or smaller. ${asset.fileName ?? "Selected file"} is ${formatSizeMb(fileSize)}.`,
      );
      return;
    }

    setValidationMessage("");
    appendFile({
      uri: asset.uri,
      type: asset.type === "video" ? "video/mp4" : "image/jpeg",
      name: asset.fileName ?? `${fallbackType}.${fallbackType === "image" ? "jpg" : "mp4"}`,
      width: asset.width,
      height: asset.height,
      fileSize,
    });
  };

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
        for (const asset of result.assets) {
          await appendAssetIfValid(asset, type);
        }
      }
    } catch (err) {
      console.error("File picking error:", err);
      setValidationMessage("Unable to pick media right now. Please try again.");
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
        for (const asset of result.assets) {
          await appendAssetIfValid(asset, asset.type === "video" ? "video" : "image");
        }
      }
    } catch (err) {
      console.error("File picking error:", err);
      setValidationMessage("Unable to pick media right now. Please try again.");
    }
  };

  const deleteSelectedFile = (index: number) => {
    setSelectedFile((prev) => {
      if (!prev) return prev;
      const copy = [...prev];
      copy.splice(index, 1);
      if (copy.length === 0) {
        setValidationMessage("");
      }
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
          accessibilityLabel="Post content"
        />

        {selectedFile && selectedFile.length > 0 && (
          <PostFilePreview file={selectedFile} editable delFunc={deleteSelectedFile} />
        )}
      </ScrollView>

      {/* ACTION BUTTONS */}
      <View style={styles.postIcons}>
        <TouchableOpacity
          style={styles.mediaActionButton}
          onPress={pickMedia}
          accessibilityRole="button"
          accessibilityLabel="Add photo or video"
        >
          <FontAwesome name="picture-o" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaActionButton}
          onPress={() => pickFile("video")}
          accessibilityRole="button"
          accessibilityLabel="Add video"
        >
          <Entypo name="video-camera" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaActionButton}
          onPress={() => pickFile("image")}
          accessibilityRole="button"
          accessibilityLabel="Add image"
        >
          <Ionicons name="images-outline" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {!!validationMessage && <Text style={styles.validationMessage}>{validationMessage}</Text>}
    </View>
  );
};

export default PostInput;
