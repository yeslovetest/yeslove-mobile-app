import React, { useRef, useEffect, useState } from "react";
import {
  Modal,
  Animated,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import styles from "./PostModalStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { postNewPostAction } from "@/app/store/Home-store/feedSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import PostInput from "./Post-modal-components/Post-input/PostInput";
import PostingUserProfile from "./Post-modal-components/Posting-user-profile/PostingUserProfile";
import { MEDIA_UPLOAD_LIMITS } from "@/constants/mediaLimits";

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch()
  const { height: screenHeight } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const [isRendered, setIsRendered] = useState(visible);
  const [userPost, setUserPost] = useState("");
  const [selectedFile, setSelectedFile] = useState<Array<{ uri: string; type: string; name?: string; fileSize?: number }> | null>(null);
  const [validationMessage, setValidationMessage] = useState("");

  const userName = useAppSelector(
    (state) => state.user.name ?? ""
  );
  const userId = useAppSelector((state) => state.user.id ?? "");
  const profilePic = useAppSelector((state) => state.profile.profiles[userId]?.profile_pic ?? "");

  const mediaID = useAppSelector((state) => state.media.uploadedMediaId);


  useEffect(() => {
    // Recompute hidden offset on rotation so slide animation stays fully off-screen.
    const hiddenOffset = screenHeight;

    if (visible) {
      setIsRendered(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: hiddenOffset,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsRendered(false);
      });
    }
  }, [visible, screenHeight, slideAnim]);

  if (!isRendered) return null;

  const handleClose = () => {
    onClose();
    setUserPost("");
    setSelectedFile(null);
    setValidationMessage("");

   
  };


  const handlePost = async (anonymous?: boolean) => {
    if (!userPost.trim()) return;

    const hasOversizedMedia = (selectedFile ?? []).some(
      (file) =>
        typeof file.fileSize === "number" &&
        file.fileSize > MEDIA_UPLOAD_LIMITS.postMediaFileMaxBytes
    );
    if (hasOversizedMedia) {
      setValidationMessage("One or more selected media files exceed the 15MB limit.");
      return;
    }

    setValidationMessage("");

    dispatch(postNewPostAction({
      content: userPost,
      anonymous: !!anonymous,
      mediaFiles: selectedFile ?? undefined,
    }));

    handleClose();
  };



  return (
    <Modal transparent visible={isRendered} animationType="none">
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <KeyboardAvoidingView
            style={styles.modalBody}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.exitHeader}>
              <Ionicons style={styles.closeIcon}
                onPress={handleClose}
                name="close"
                size={30}
                color="black"
              />
              <Text style={styles.createPost}>Create post</Text>
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.actionButtons} onPress={() => handlePost(false)}>
                  <Text style={styles.actionButtonsText}>Share
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handlePost(true)} style={styles.actionButtons}>
                  <Text style={styles.actionButtonsText}>Post Anonymously
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <PostingUserProfile username={userName} profilePic={profilePic} />
              <PostInput 
                userPost={userPost} 
                setUserPost={setUserPost} 
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                validationMessage={validationMessage}
                setValidationMessage={setValidationMessage}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PostModal;
