import { setUserPassword } from "@/app/store/Auth-store/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, TouchableOpacity, View, Text, TextInput } from "react-native";
import styles from "../GeneralStyles";
import { useMsgToggle } from "@/hooks/messageToggle";

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [isRendered, setIsRendered] = useState(visible);
  const dispatch = useAppDispatch();
  const currentPassword = useAppSelector((state) => state.user.password);
  const msg = useAppSelector((state) => state.auth.message);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const msgToggle = useMsgToggle();

  const changePassword = () => {
    if (password === currentPassword) {
      if (newPassword && newPassword === confirmPassword) {
        dispatch(setUserPassword({ new_password: newPassword }));
      } else {
        msgToggle.updateErrorMsg("new password does not match or is invalid");
      }
    } else {
      msgToggle.updateErrorMsg("password incorrect");
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

  useEffect(() => {
    //make the message appear for 3s
    msgToggle.toggleMsg(msg);
  }, [msgToggle.errorMsg, msg]);

  return (
    <Modal transparent visible={isRendered} animationType="none">
      {isRendered && (
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity activeOpacity={1}>
            <Animated.View
              style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}
            >
              <View style={styles.settingsSubSection}>
                {msgToggle.errorMsg && (
                  <Text style={{ ...styles.sectionText, color: "red" }}> {msgToggle.errorMsg}</Text>
                )}
                {msgToggle.msg && (
                  <Text style={{ ...styles.sectionText, color: "blue" }}> {msgToggle.msg}</Text>
                )}
                <TextInput
                  style={styles.subSectionInput}
                  placeholder="Enter current password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <TextInput
                  style={styles.subSectionInput}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                <TextInput
                  style={styles.subSectionInput}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                <TouchableOpacity style={styles.saveChangesButton} onPress={changePassword}>
                  <Text style={styles.saveChangesButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </Modal>
  );
};

export default ChangePasswordModal;
