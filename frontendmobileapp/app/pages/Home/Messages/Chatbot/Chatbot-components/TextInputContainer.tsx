import styles from '../SharedChatbotStyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

const TextInputContainer = ( { onSend }: { onSend: (text: string) => void } ) => {
const [text, setText] = useState('');
const lastSentRef = useRef<{ text: string; at: number }>({ text: '', at: 0 });

const send = (msg: string) => {
    const trimmed = msg.trim();
    const now = Date.now();

    // Avoid duplicate sends when Enter events fire more than once on some platforms.
    if (trimmed === lastSentRef.current.text && now - lastSentRef.current.at < 500) {
      return;
    }

    if (trimmed) {
      lastSentRef.current = { text: trimmed, at: now };
      onSend(trimmed);
      setText('');
    }
  };

  return (
    <View style={styles.textInputContainer}>
      <TextInput style={[styles.textInput, {
        outlineWidth: 0,
        outlineColor: 'transparent',
      }]} placeholder="How are you feeling today?"
      placeholderTextColor="#c9c9c9"
      value={text}
      onChangeText={setText}
      onSubmitEditing={() => send(text)}
      returnKeyType="send"
      blurOnSubmit={false}
      multiline>
      </TextInput>
        <Ionicons onPress={() => send(text)} style={styles.sendIcon} name="send" size={18} />
    </View>
  )
}

export default TextInputContainer
