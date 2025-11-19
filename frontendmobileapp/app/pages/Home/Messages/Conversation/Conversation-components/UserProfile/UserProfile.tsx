import React from 'react'
import { View, Image } from 'react-native'
import styles from './UserProfileStyles'
import { BASE_URL } from '@/app/index'

interface Props {
  photo: string;
}

const UserProfile = (props: Props) => {
  return (
    <View>
      <Image 
        style={styles.profileImg} 
        source={{uri: props.photo.startsWith("/api") ? `${BASE_URL}${props.photo}` : props.photo}}
      /> 
    </View>
  )
}

export default UserProfile
