import React from 'react';
import { Text, View } from 'react-native';
import styles from '../SharedChatbotStyles';

export default function ChatPrompt({ prompt, time }: { prompt: string; time: Date }) {

  const hhmm = time
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    .replace(/^0/, '');

  return (
    <View style={styles.chatPromptContainer}>
      <View style={styles.promptAndTimeSentContainer}>
      <View style={styles.chatPrompt}>
        <Text style={styles.promptText}>{prompt}</Text>
      </View>
      {/* render time here*/}
      <Text style={styles.timeSentPrompt}>{hhmm}</Text>
      </View>
    </View>
  )
}