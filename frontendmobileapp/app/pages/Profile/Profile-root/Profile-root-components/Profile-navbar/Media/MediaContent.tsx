import React from 'react'
import { View } from 'react-native'
import MediaPlaceholders from './Media-components/MediaPlaceholders'
import styles from './MediaContentStyles'
import OneMedium from './Media-components/One-medium/OneMedium'

const MediaContent = () => {
  return (
    <View
      style={[
        styles.container,
        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }
      ]}
    >
      {MediaPlaceholders.map((media, index) => (
        <OneMedium image={media.image} key={index} />
      ))}
    </View>
  )
}

export default MediaContent
