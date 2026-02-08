import styles from './TextInputStyles';
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useState } from 'react';
import { TextInput, View } from 'react-native';

const TextInputContainer = ( { onSend }: { onSend: (text: string) => void } ) => {
const [text, setText] = useState('');

const send = (msg: string) => {
    const trimmed = msg.trim();
    if (trimmed) {
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
      onChangeText={(t) => {
          if (t.endsWith('\n')) {
            send(t.replace(/\n+$/, ''));
          } else {
            setText(t);
          }
        }}
        onKeyPress={({ nativeEvent }) => {
          if (nativeEvent.key === 'Enter') {
            send(text);
          }
        }}
      multiline>
      </TextInput>
        <AntDesign onPress={() => send(text)} style={styles.sendIcon} name="arrowup" size={22} />
    </View>
  )
}

export default TextInputContainer
