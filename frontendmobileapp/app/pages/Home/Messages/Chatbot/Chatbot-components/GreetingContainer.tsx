import styles from '../SharedChatbotStyles';
import React from 'react';
import { View, Image } from 'react-native';



const GreetingContainer = () => {
const Robot = require("../Chatbot-assets/robot.webp")

  return (
       <View style={styles.greetingContainer}>
            <Image style={styles.greetingRobot} source={Robot}></Image>
          </View>
  )
}

export default GreetingContainer
