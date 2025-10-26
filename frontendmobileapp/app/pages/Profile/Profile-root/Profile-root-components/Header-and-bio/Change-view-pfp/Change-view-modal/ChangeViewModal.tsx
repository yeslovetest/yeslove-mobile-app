import React, { useRef, useEffect, useState } from 'react';
import { Modal, TouchableOpacity, Animated, Text, View } from 'react-native';
import styles from './ChangeViewModalStyles';

interface ChangeViewModalProps {
    visible: boolean;
    onClose: () => void;
}

const ChangeViewModal: React.FC<ChangeViewModalProps> = ({ visible, onClose }) => {
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
                        <View style={styles.changeViewSubSection}>
                            <TouchableOpacity style={styles.changeViewButton}>
                                <Text style={styles.changeViewButtonText}>Change Profile Picture</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.changeViewButton}>
                                <Text style={styles.changeViewButtonText}>View Profile Picture</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};


export default ChangeViewModal;