import React from 'react'
import { View, Image } from 'react-native'
import styles from './UserProfileStyles'
import { BASE_URL } from '@/app/config/baseUrl'
import { getImageSource } from '@/constants/imageFallbacks';

interface Props {
  photo: string;
}

const UserProfile = (props: Props) => {
  return (
    <View>
      <Image 
        style={styles.profileImg} 
        source={getImageSource(props.photo.startsWith('/api') ? `${BASE_URL}${props.photo}` : props.photo, 'profile')}
      /> 
    </View>
  )
}

export default UserProfile
