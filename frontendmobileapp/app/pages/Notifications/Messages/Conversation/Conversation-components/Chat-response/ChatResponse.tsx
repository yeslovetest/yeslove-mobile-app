import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from './ChatResponseStyles';
import UserProfile from '../UserProfile/UserProfile';

interface Props {
  text: string;
  time: Date;
}

const ChatResponse = ({ text, time }: Props) => {
  const hhmm = time
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    .replace(/^0/, '');

  return (
    <View style={styles.chatResponseContainer}>
      <UserProfile />
      <View style={{ flexShrink: 1 }}>
        <View style={styles.chatResponse}>
          <Text numberOfLines={3} ellipsizeMode="tail" style={styles.responseText}>
            {text}
          </Text>
          <Text style={styles.timeSentResponse}>{hhmm}</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatResponse;
