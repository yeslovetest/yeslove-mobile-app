import React from 'react'
import { View, Image, Text } from 'react-native'
import styles from './OneMessageStyles'
import { Message } from './PlaceholderMessages'

export interface Props {
  message: Message
}

const OneMessage = ({ message }: Props) => {
  return (
    <View style={[
      styles.container,
      !message.opened && styles.activeBackgroundColor
    ]}>
      {!message.opened && <View style={styles.activeIndicator}></View>}

      <Image source={message.image} style={styles.profilePicture} />

      <View style={styles.messageContainer}>
        <Text style={message.opened ? styles.userOpened : styles.userUnopened}>
          {message.user}
        </Text>
        <Text numberOfLines={2}
          ellipsizeMode="tail" style={message.opened ? styles.messageOpened : styles.messageUnopened}>
          {message.message}
        </Text>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.time}>{message.timeReceived}</Text>
      </View>
    </View>
  )
}

export default OneMessage

