import React from 'react';
import { Text, View, Image } from 'react-native';
import styles from '../SharedChatbotStyles';
import { useAppSelector } from '@/app/store/hooks';
import { getImageSource } from '@/constants/imageFallbacks';

export default function ChatPrompt({ prompt, time }: { prompt: string; time: Date }) {
  const userId = useAppSelector((state) => state.user.id ?? '');
  const profilePic = useAppSelector((state) => state.profile.profiles[userId]?.profile_pic ?? '');

  const hhmm = time
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    .replace(/^0/, '');

  return (
<View style={styles.chatPromptContainer}>
  <View style={styles.promptAndTimeSentContainer}>
    <View style={styles.chatPrompt}>
      <Text style={styles.promptText} numberOfLines={0}>
        {prompt}
      </Text>
        <Text style={styles.timeSentPrompt}>{hhmm}</Text>
    </View>
    

    <Image style={styles.profileImg} source={getImageSource(profilePic, 'profile', { treatBareAsMediaId: true })} />
  </View>


</View>

  )
}