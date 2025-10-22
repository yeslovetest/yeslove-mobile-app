import React, { useRef, useEffect, useState } from "react";
import {
  Modal,
  Animated,
  View,
  Dimensions, Text,
  TouchableOpacity,
} from "react-native";
import styles from "./PostModalStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { postNewPostAction } from "@/app/store/Home-store/feedSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import PostInput from "./Post-modal-components/Post-input/PostInput";
import PostingUserProfile from "./Post-modal-components/Posting-user-profile/PostingUserProfile";

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch()
  const screenHeight = Dimensions.get("window").height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const [isRendered, setIsRendered] = useState(visible);
  const [userPost, setUserPost] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ uri: string; type: string; name?: string } | null>(null);

  const userName = useAppSelector(
    (state) => state.user.name ?? ""
  );


  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsRendered(false);
      });
    }
  }, [visible]);

  if (!isRendered) return null;

  const handleClose = () => {
    onClose();
    setUserPost("");
    setSelectedFile(null);
  };

  function dataURLtoFile(dataUrl: string, filename: string) {
      // covert base64/URLEncoded data component to raw binary data held in a string - 
      // for web browser testing (not needed on mobile)
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
  }

  const handlePost = async () => {
    if (!userPost.trim()) return;

    const formData = new FormData();
    formData.append("content", userPost);

    console.log("Selected file for upload:", selectedFile);

    if (selectedFile) {
      const fieldName = "media"; 

      // detect if it's base64 or file URI
      if (selectedFile.uri.startsWith("file:")) {
        // handle both image and video here
        const file = selectedFile;
        formData.append(fieldName, {
          uri: file.uri,
          type: file.type, // "image/jpeg" or "video/mp4"
          name: file.name || (file.type.startsWith("video") ? "video.mp4" : "photo.jpg"), 
        } as any);
      } 
      else if (selectedFile.uri.startsWith("data:")) {
        // handle base64 (e.g., for web)
        const file: File | any = dataURLtoFile(
          selectedFile.uri,
          selectedFile.name ??
            (selectedFile.type.startsWith("video") ? "video.mp4" : "photo.jpg") 
        );
        formData.append(fieldName, file);
      }
    }

    dispatch(postNewPostAction({ requestForm: formData as any }));
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
          <View style={styles.exitHeader}>
            <Ionicons style={styles.closeIcon}
              onPress={handleClose}
              name="close"
              size={32}
              color="black"
            />
            <Text style={styles.createPost}>Create post</Text>
            <TouchableOpacity onPress={handlePost}>
              <Text>Share
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <PostingUserProfile username={userName} profilePic="https://i.pinimg.com/736x/f3/85/d7/f385d78eba93e8b768bcc04bf96fe5a5.jpg" />
            <PostInput 
              userPost={userPost} 
              setUserPost={setUserPost} 
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}/>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PostModal;
