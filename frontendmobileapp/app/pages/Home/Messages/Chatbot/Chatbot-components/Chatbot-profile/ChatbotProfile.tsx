import React from 'react'
import { View, Image, Text, } from 'react-native'
import styles2 from './ChatbotProfileStyles'
import styles from '../../SharedChatbotStyles'

const ChatbotProfile = () => {
    const Robot = require("../../Chatbot-assets/robot.webp")
    return (
            <View style={styles.headerContainer}>
                <View style={styles.onlineNowContainer}></View>
                <View style={styles2.botProfile}>
                    <Image source={Robot} style={styles2.botProfileImagee}></Image>
                </View>
                <View>
                    <Text style={styles.chatbot}>Chatbot</Text>
                    <Text style={styles.onlineNow}><View style={styles.onlineSymbol}></View>Online now</Text>
                </View>
            </View>
    )
}

export default ChatbotProfile
