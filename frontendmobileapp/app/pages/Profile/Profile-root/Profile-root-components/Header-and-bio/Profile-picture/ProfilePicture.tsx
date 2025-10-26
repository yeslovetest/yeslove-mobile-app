import axios from 'axios'
import React from 'react'
import { Image } from 'react-native'
import styles from './ProfilePictureStyles'
import { useAppSelector } from '@/app/store/hooks'

const ProfilePicture = () => {
const userId = useAppSelector((state) => state.navigation.tabStack.at(-1)?.data?.userId);
 const profileImage = useAppSelector((state) => state.profile.profiles[userId]?.profile_pic ?? "");

  return (

    <Image style={styles.profileImage} source={{ uri:   axios.defaults.baseURL + "/api/media/" +  profileImage}} />
  )
}

export default ProfilePicture
