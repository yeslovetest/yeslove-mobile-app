import React from 'react'
import { View, Image } from 'react-native'
import { Video } from 'expo-av';
import styles from './OneMediumStyles'
import { MediaFile } from '@/generated-api';
import { BASE_URL } from '@/constants/api';

export interface Props{
    media: MediaFile;
}

const OneMedium = (props: Props) => {

  return (
    <View style={styles.mediumContainer}> 
      {props.media?.content_type?.startsWith('image') && (
        <Image source={{ uri: `${BASE_URL}${props.media?.url?.startsWith('/') ? '' : '/'}${props.media?.url}` }}
          style={styles.imageMedium}>
        </Image>
      )}

      {props.media?.content_type?.startsWith('video') && (
        <Video
          source={{ uri: `${BASE_URL}${props.media?.url?.startsWith('/') ? '' : '/'}${props.media?.url}` }}
          style={styles.videoMedium}
          useNativeControls
          resizeMode={"contain" as any}
        /> 
      )}
      
    </View>
  )
}

export default OneMedium
