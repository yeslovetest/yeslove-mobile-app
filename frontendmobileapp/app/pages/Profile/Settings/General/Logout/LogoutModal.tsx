import React, { useRef, useEffect, useState } from 'react';
import { Modal, TouchableOpacity, Animated, Text, View } from 'react-native';
import styles from '../GeneralStyles';
import { useAppDispatch } from '@/app/store/hooks';
import { logoutAction } from '@/app/store/Auth-store/authSlice';
import { TOKEN_REFRESH_SERVICE } from '@/ts/token-service';

interface LogoutModalProps {
    visible: boolean;
    onClose: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onClose }) => {
    const slideAnim = useRef(new Animated.Value(300)).current;
    const [isRendered, setIsRendered] = useState(visible);
    const dispatch = useAppDispatch()


    const logOut = async () => {
        try {
            const refreshToken = await TOKEN_REFRESH_SERVICE.loadRefreshTokenFromLocalStorage();
            dispatch(logoutAction(refreshToken || ''));
        } catch (error) {
            console.error('Logout error:', error);
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
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity activeOpacity={1}>
                    <Animated.View
                        style={[
                            styles.modalContent,
                            { transform: [{ translateY: slideAnim }] },
                        ]}
                    >
                        <View style={styles.settingsSubSection}>
                            <Text style={styles.modalText}>Are you sure you want to log out of this account? </Text>
                            <TouchableOpacity style={styles.saveChangesButton} onPress={logOut}>
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