import React, { useRef, useEffect, useState } from "react";
import { Modal, TouchableOpacity, Animated, Text, View } from "react-native";
import styles from "../GeneralStyles";
import { useAppDispatch } from "@/app/store/hooks";
import { setDeleteConfirmation } from "@/app/store/Auth-store/authSlice";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [isRendered, setIsRendered] = useState(visible);
  const dispatch = useAppDispatch();

  const deleteAccount = () => {
    dispatch(setDeleteConfirmation({ confirmation: true }));
  };

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

  return (
    <Modal transparent visible={isRendered} animationType="none">
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        {/* No onPress: only absorbs taps so they don't reach the backdrop above. */}
        <TouchableOpacity activeOpacity={1} accessible={false}>
          <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.settingsSubSection}>
              <Text style={styles.modalText}>Are you sure you want to delete this account? </Text>
              <TouchableOpacity
                style={styles.saveChangesButton}
                onPress={deleteAccount}
                accessibilityRole="button"
                accessibilityLabel="Delete account"
              >
                <Text style={styles.saveChangesButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default DeleteAccountModal;
