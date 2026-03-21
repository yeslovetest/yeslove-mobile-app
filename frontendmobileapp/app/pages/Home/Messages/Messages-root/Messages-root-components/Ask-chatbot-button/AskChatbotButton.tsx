import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import styles from './AskChatbotButtonStyles'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type Props = {
  onClick: () => void
}

const AskChatbotButton = (props: Props) => {
  return (
    <TouchableOpacity onPress={props.onClick} style={styles.container}>
  <View style={styles.chatbotButton}>
    <MaterialCommunityIcons name="account-heart-outline" size={24} style={styles.icon}/>
    <Text style={styles.chatbotButtonText}>
      Need support right now? Chat with Sera
    </Text>
  </View>
</TouchableOpacity>
  )
}

export default AskChatbotButton
