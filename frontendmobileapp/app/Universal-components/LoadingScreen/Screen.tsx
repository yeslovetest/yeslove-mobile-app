import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Modal, View } from "react-native";
import styles from "./LoadingScreenStyle";
import { theme } from "@/app/theme";

const LoadingOverlay = ({ visible, color = theme.colors.textOnPrimary }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType="fade"
      visible={visible}
      pointerEvents="none" // prevent interactions
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <ActivityIndicator size="large" color={color} />
      </Animated.View>
    </Modal>
  );
};

export default LoadingOverlay;
