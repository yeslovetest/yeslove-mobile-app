import React, { useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import styles from './ConversationTextInputStyles';
import { TextInput, View } from 'react-native';

interface Props {
    onSend?: (text: string) => void;
    openMedia?: (type: string) => void;
};

const ConversationTextInput = ( props: Props) => {

  const [text, setText] = useState('');
  

  const send = (msg: string) => {
    const trimmed = msg.trim();
    if (trimmed) {
      props.onSend?.(trimmed);
      setText('');
    }
  };

  const selectMedia =  (type: string) => {
    if (type === "media") {
        // Allow both images and videos 
        props.openMedia?.(type);
    }    
  }
          

  

  return (
    <View style={styles.textInputContainer}>
      <AntDesign onPress={() => selectMedia('media')} style={styles.sendIcon} name="camera" size={18} />
      <TextInput
        style={[styles.textInput, { outlineWidth: 0, outlineColor: 'transparent' }]}
        placeholder="Type message"
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
