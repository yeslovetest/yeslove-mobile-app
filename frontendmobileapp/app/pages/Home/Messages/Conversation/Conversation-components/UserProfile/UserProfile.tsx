import React from 'react'
import { View, Image } from 'react-native'
import profileImg from "../../../../../../../assets/images/profileImg1.jpg"
import styles from './UserProfileStyles'

const UserProfile = () => {
  return (
    <View>
      <Image style={styles.profileImg} source={profileImg}></Image>
    </View>
  )
}

export default UserProfile
