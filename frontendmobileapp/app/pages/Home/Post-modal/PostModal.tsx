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
  };

  const handlePost = () => {
    if (!userPost.trim()) return;
    dispatch(postNewPostAction({ content: userPost }));
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
          <PostingUserProfile username="Test-user" profilePic="https://i.pinimg.com/736x/f3/85/d7/f385d78eba93e8b768bcc04bf96fe5a5.jpg" />
         <PostInput userPost={userPost} setUserPost={setUserPost} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PostModal;
