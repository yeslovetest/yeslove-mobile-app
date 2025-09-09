import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import styles from './ConversationTextInputStyles';

const ConversationTextInput = ({ onSend }: { onSend?: (text: string) => void }) => {
  const [text, setText] = useState('');

  const send = (msg: string) => {
    const trimmed = msg.trim();
    if (trimmed) {
      onSend?.(trimmed);
      setText('');
    }
  };

  return (
    <View style={styles.textInputContainer}>
      <TextInput
        style={[styles.textInput, { outlineWidth: 0, outlineColor: 'transparent' }]}
        placeholder="How are you feeling today?"
        placeholderTextColor="#c9c9c9"
        value={text}
        onChangeText={(t) => {
          if (t.endsWith('\n')) send(t.replace(/\n+$/, ''));
          else setText(t);
        }}
        onKeyPress={({ nativeEvent }) => {
          if (nativeEvent.key === 'Enter') send(text);
        }}
        multiline
      />
      <AntDesign onPress={() => send(text)} style={styles.sendIcon} name="arrowup" size={18} />
    </View>
  );
};

export default ConversationTextInput;
