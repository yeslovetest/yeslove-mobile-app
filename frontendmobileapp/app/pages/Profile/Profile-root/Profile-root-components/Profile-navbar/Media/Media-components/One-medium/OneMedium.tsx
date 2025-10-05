import React from 'react'
import { View, Image } from 'react-native'
import styles from './OneMediumStyles'

export interface Props{
    image: any
}

const OneMedium = (props: Props) => {
  return (
    <View style={styles.mediumContainer}> 
      <Image source={props.image} style={styles.medium}></Image>
    </View>
  )
}

export default OneMedium
