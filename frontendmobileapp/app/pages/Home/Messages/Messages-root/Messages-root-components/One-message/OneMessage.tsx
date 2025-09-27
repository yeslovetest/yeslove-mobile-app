import React from 'react'
import { View, Image, Text } from 'react-native'
import styles from './OneMessageStyles'
import { FriendInfo } from '@/generated-api'
import dayjs from 'dayjs'

export interface Props {
  message: FriendInfo
}

const OneMessage = ({ message }: Props) => {
  return (
    <View style={[
      styles.container,
      message?.unread && styles.activeBackgroundColor
    ]}>
      {message?.unread && <View style={styles.activeIndicator}></View>}

      <Image source={message?.profile_pic ?? ''} style={styles.profilePicture} />

      <View style={styles.messageContainer}>
        <Text style={!message?.unread ? styles.userOpened : styles.userUnopened}>
          {message?.username}
        </Text>
        <Text numberOfLines={2}
          ellipsizeMode="tail" style={!message?.unread ? styles.messageOpened : styles.messageUnopened}>
          {message?.last_message}
        </Text>
      </View>

      <View style={styles.timeContainer}>
        <Text  style={styles.time}>{dayjs(message?.last_message_time).format('MMM D, YYYY h:mm A')}</Text>
      </View>
    </View>
  )
}

export default OneMessage

