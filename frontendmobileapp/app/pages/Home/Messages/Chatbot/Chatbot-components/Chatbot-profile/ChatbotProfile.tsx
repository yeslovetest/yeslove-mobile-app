import React from 'react'
import { View, Image, Text, } from 'react-native'
import styles2 from './ChatbotProfileStyles'
import styles from '../../SharedChatbotStyles'
import { CHATBOT_HUMAN_AVATAR } from '@/constants/imageFallbacks'

const ChatbotProfile = () => {
    const assistantName = "Sera"
    return (
            <View style={styles.headerContainer}>
                <View style={styles.onlineNowContainer}></View>
                <View style={styles2.botProfile}>
                    <Image source={CHATBOT_HUMAN_AVATAR} style={styles2.botProfileImagee}></Image>
                </View>
                <View>
                    <Text style={styles.chatbot}>{assistantName}</Text>
                    <View style={styles.onlineNowRow}>
                        <View style={styles.onlineSymbol}></View>
                        <Text style={styles.onlineNow}>Online now</Text>
                    </View>
                </View>
            </View>
    )
}

export default ChatbotProfile
