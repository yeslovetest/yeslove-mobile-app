import React from 'react'
import { View } from 'react-native'
import MediaPlaceholders from './Media-components/MediaPlaceholders'
import styles from './MediaContentStyles'
import OneMedium from './Media-components/One-medium/OneMedium'
import {useAppSelector} from '@/app/store/hooks'

const MediaContent = () => {

  const mediaItems = useAppSelector(state => state.media.mediaList);

  return (
    <View
      style={[
        styles.container,
        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }
      ]}
    >
      {mediaItems.map((media, index) => (
        <OneMedium media={media} key={index} />
      ))}
    </View>
  )
}

export default MediaContent
