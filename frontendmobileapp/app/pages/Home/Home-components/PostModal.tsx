import React, { useRef, useEffect, useState } from 'react';
import { Modal, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import UserPostBox from './UserPostBox';

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [isRendered, setIsRendered] = useState(visible);

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
        toValue: 300,
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
  };

  return (
    <Modal transparent visible={isRendered} animationType="none">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose}>
        <TouchableOpacity activeOpacity={1}>
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <UserPostBox onPost={handleClose} />
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

export default PostModal;
