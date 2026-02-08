import React, { useRef, useEffect, useState } from 'react';
import { Modal, TouchableOpacity, Animated, Text, View } from 'react-native';
import styles from '../ChangeViewModalStyles';
import * as ImagePicker from 'expo-image-picker';

interface ChangeModalProps {
    visible: boolean;
    onClose: () => void;
}

const ChangeModal: React.FC<ChangeModalProps> = ({ visible, onClose }) => {
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

    const openLibrary = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, 
            allowsEditing: true, 
            aspect: [4, 3],
            quality: 1, 
        });

        if (!result.canceled) {
            console.log(result.assets[0].uri); 
        }
    }

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Camera permission is required to take pictures');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            console.log('Photo URI:', result.uri);
        }
    };


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
                            <TouchableOpacity style={styles.changeViewButton} onPress={openLibrary}>
                                <Text style={styles.changeViewButtonText}>Choose from library</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.changeViewButton} onPress={openCamera}>
                                <Text style={styles.changeViewButtonText}>Take picture</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};


export default ChangeModal;