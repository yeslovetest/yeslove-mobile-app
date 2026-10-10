import React, { useRef, useEffect, useState } from "react";
import { Modal, TouchableOpacity, Animated, Text, View } from "react-native";
import styles from "../GeneralStyles";
import { useAppDispatch } from "@/app/store/hooks";
import { logoutAction } from "@/app/store/Auth-store/authSlice";
import { TOKEN_REFRESH_SERVICE } from "@/ts/token-service";
import { activateLoadingScreen } from "@/app/store/Profile-store/profileSlice";

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const dispatch = useAppDispatch();
  const [isRendered, setIsRendered] = useState(visible);

  const logOut = async () => {
    try {
      const refreshToken = await TOKEN_REFRESH_SERVICE.loadRefreshTokenFromLocalStorage();
      dispatch(logoutAction(refreshToken || ""));
      dispatch(activateLoadingScreen(true));
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
    }
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
              <Text style={styles.modalText}>
                Are you sure you want to log out of this account?{" "}
              </Text>
              <TouchableOpacity
                style={styles.saveChangesButton}
                onPress={logOut}
                accessibilityRole="button"
                accessibilityLabel="Log out"
              >
                <Text style={styles.saveChangesButtonText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default LogoutModal;
