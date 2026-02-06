import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import styles from '../SharedChatbotStyles';
import ChatbotProfile from './Chatbot-profile/ChatbotProfile';
import Markdown from "react-native-markdown-display";
import markdownStyles from './MarkdownResponseStyles';

const TYPE_SPEED = 1;

const ChatResponse = ({ text, time }: { text: string; time: Date }) => {
  const [visible, setVisible] = useState("");

  const hhmm = time
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    .replace(/^0/, "");

  useEffect(() => {
    let index = 0;
    setVisible("");

    const id = setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(id);
      }
    }, TYPE_SPEED);

    return () => clearInterval(id);
  }, [text]);

  return (
    <View style={styles.chatResponseContainer}>
      <ChatbotProfile />

      <View style={{ flexShrink: 1 }}>
        <View style={styles.chatResponse}>
          <Markdown style={markdownStyles}>
            {visible}
          </Markdown>
        </View>

        <Text style={styles.timeSentResponse}>{hhmm}</Text>
      </View>
    </View>
  );
};

export default ChatResponse;

