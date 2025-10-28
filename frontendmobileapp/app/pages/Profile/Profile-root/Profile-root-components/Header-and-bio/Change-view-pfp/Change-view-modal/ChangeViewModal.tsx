import React, { useRef, useEffect, useState } from 'react';
import { Modal, TouchableOpacity, Animated, Text, View } from 'react-native';
import styles from './ChangeViewModalStyles';
import ChangeModal from './Change-modal/ChangeModal';

interface ChangeViewModalProps {
    visible: boolean;
    onClose: () => void;
}

const ChangeViewModal: React.FC<ChangeViewModalProps> = ({ visible, onClose }) => {
    const slideAnim = useRef(new Animated.Value(300)).current;
    const [isRendered, setIsRendered] = useState(visible);
    const [changeModal, setChangeModal] = useState(false)

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

    const handleChangeProfile = () => {
        setChangeModal(true);
    };

    const handleViewProfile = () => {
        onClose(); 
    };

      const handleChangeModalClose = () => {
        setChangeModal(false);
        onClose();
    };




    return (
        <>
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
                            <TouchableOpacity style={styles.changeViewButton} onPress={handleChangeProfile}>
                                <Text style={styles.changeViewButtonText}>Change Profile Picture</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.changeViewButton} onPress={handleViewProfile}>
                                <Text style={styles.changeViewButtonText}>View Profile Picture</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
        
                        <ChangeModal  visible={changeModal}
                            onClose={handleChangeModalClose}></ChangeModal>
    </>
    );
};


export default ChangeViewModal;