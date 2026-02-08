import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from './ChatResponseStyles';
import UserProfile from '../UserProfile/UserProfile';
import MediaFilePreview from '../MediaPreview/mediaPreview';
import { MediaFile } from '@/generated-api';

interface Props {
  text: string;
  time: string;
  profilePic: string,
  media: { uri?: string, type?: string, media_url?: string, name?: string }[] | MediaFile[];
}

const ChatResponse = ({ text, time, profilePic, media }: Props) => {

  return (
    <View style={styles.chatResponseContainer}>
      <UserProfile photo={profilePic} />
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
