import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from './ChatResponseStyles';
import UserProfile from '../UserProfile/UserProfile';
import MediaFilePreview from '../MediaPreview/mediaPreview';

interface Props {
  text: string;
  time: string;
  media: { uri?: string, type?: string, media_url?: string, name?: string }[];
}

const ChatResponse = ({ text, time, media }: Props) => {
  /*const hhmm = time
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    .replace(/^0/, ''); */

  return (
    <View style={styles.chatResponseContainer}>
      <UserProfile />
      <View style={{ flexShrink: 1 }}>
        <View style={styles.chatResponse}>
          <MediaFilePreview file={media}/>
          <Text numberOfLines={3} ellipsizeMode="tail" style={styles.responseText}>
            {text}
          </Text>
          <Text style={styles.timeSentResponse}>{time}</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatResponse;
