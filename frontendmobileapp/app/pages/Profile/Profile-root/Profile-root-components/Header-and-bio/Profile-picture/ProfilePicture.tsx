import axios from 'axios'
import React, { useState } from 'react'
import { Image, TouchableOpacity } from 'react-native'
import styles from './ProfilePictureStyles'
import { useAppSelector } from '@/app/store/hooks'
import ChangeViewModal from '../Change-view-pfp/Change-view-modal/ChangeViewModal'

const ProfilePicture = () => {
const userId = useAppSelector((state) => state.navigation.tabStack.at(-1)?.data?.userId);
 const profileImage = useAppSelector((state) => state.profile.profiles[userId]?.profile_pic ?? "");
const [changeViewModal, setChangeViewModal] = useState(false)

  return (
    <>
     <TouchableOpacity onPress={() => setChangeViewModal(true)} >
    <Image style={styles.profileImage} source={{ uri:   axios.defaults.baseURL + "/api/media/" +  profileImage}} />
        </TouchableOpacity>
        
                <ChangeViewModal  visible={changeViewModal}
                    onClose={() => setChangeViewModal(false)}></ChangeViewModal>

        </>
  )
}

export default ProfilePicture
