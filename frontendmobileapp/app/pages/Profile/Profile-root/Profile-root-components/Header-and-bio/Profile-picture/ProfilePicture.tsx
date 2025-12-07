import axios from 'axios'
import React, { useState } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import styles from './ProfilePictureStyles'
import { useAppSelector } from '@/app/store/hooks'
import * as ImagePicker from "expo-image-picker"
import ChangeModal from '../Change-view-pfp/Change-view-modal/Change-modal/ChangeModal'
import placeholder from "./Profile-Images/profile-image.jpg"

const ProfilePicture = () => {
const userId = useAppSelector((state) => state.navigation.tabStack.at(-1)?.data?.userId);
 const profileImage = useAppSelector((state) => state.profile.profiles[userId]?.profile_pic ?? "");
    const [changeModal, setChangeModal] = useState(false);
    const [image, setImage] = useState()


const uploadImage = async () => {
  try {
    await ImagePicker.requestCameraPermissionsAsync();

    let result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      console.log("Image taken:", result.assets[0].uri);
    }

  } catch (error: any) {
    alert("Error uploading image: " + error.message);
  }
};

    const saveImage = async (image) => {
        try {
      setImage(image);
      setChangeModal(false)
        } catch (error) {
            throw error
        }
    }


  return (
    <>
     <TouchableOpacity onPress={() => setChangeModal(true)} >
    {image ? (
  <Image style={styles.profileImage} source={{ uri: image }} />
) : (
  <View style={[styles.profileImage, { backgroundColor: "transparent" }]} />
)}
        </TouchableOpacity>
        
                <ChangeModal onCameraPress={uploadImage} visible={changeModal}
                    onClose={() => setChangeModal(false)}></ChangeModal>

        </>
  )
}

export default ProfilePicture
