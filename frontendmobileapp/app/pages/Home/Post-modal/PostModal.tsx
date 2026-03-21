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
import { postNewPostAction, storeMediaFormData } from "@/app/store/Home-store/feedSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import PostInput from "./Post-modal-components/Post-input/PostInput";
import PostingUserProfile from "./Post-modal-components/Posting-user-profile/PostingUserProfile";
import { uploadMedia } from "@/app/store/Profile-store/mediaSlice";
import dataURLtoFile from '@/utils/mediaUrlConverter';

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
  const [selectedFile, setSelectedFile] = useState<Array<{ uri: string; type: string; name?: string }> | null>(null);

  const userName = useAppSelector(
    (state) => state.user.name ?? ""
  );

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
    console.log('media id:', mediaID);
   
  };


  const handlePost = async (anonymous?: boolean) => {
    if (!userPost.trim()) return;

    const postData = new FormData(); //form data for Post
    const mediaData = new FormData(); // form data for Media upload
    console.log(anonymous);
    postData.append("anonymous", anonymous ? "true" : "false");
    postData.append("content", userPost);
    

    //console.log("Selected file for upload:", selectedFile);

    if (selectedFile) {
      const fieldName = "file"; 
     
      selectedFile.forEach((selectedFile) => {
         // detect if it's base64 or file URI
        if (selectedFile.uri.startsWith("file:")) {
          // handle both image and video here
          const file = selectedFile;
          mediaData.append(fieldName, file as any);
        } 
        else if (selectedFile.uri.startsWith("data:")) {
          // handle base64 (e.g., for web)
          const file: File | any = dataURLtoFile(
            selectedFile.uri,
            selectedFile.name ??
              (selectedFile.type.startsWith("video") ? "video.mp4" : "photo.jpg") 
          );
          mediaData.append(fieldName, file);
        }
      });  
      dispatch(storeMediaFormData({mediaFormData: mediaData}));
    }

    dispatch(postNewPostAction({ requestForm: postData as any }));
    
    //dispatch(uploadMedia({requestBody: mediaData as any}));
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
                  <Text style={styles.actionButtonsText}>Post Anonymous
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <PostingUserProfile username={userName} profilePic="https://i.pinimg.com/736x/f3/85/d7/f385d78eba93e8b768bcc04bf96fe5a5.jpg" />
              <PostInput 
                userPost={userPost} 
                setUserPost={setUserPost} 
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}/>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PostModal;
