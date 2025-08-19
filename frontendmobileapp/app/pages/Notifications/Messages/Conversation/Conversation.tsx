import Header from '@/app/Universal-components/Header/Header';
import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import ChatResponse from './Conversation-components/Chat-response/ChatResponse';
import Message from './Conversation-components/Message/Message';
import ConversationTextInput from './Conversation-components/Conversation-text-input/ConversationTextInput';
import styles from './ConversationStyles';

const Conversation = () => {
  const [messages, setMessages] = useState([
    { type: 'response', text: "Hi, how are you feeling today?", createdAt: new Date() },
    { type: 'prompt', text: "I'm feeling a bit anxious.", createdAt: new Date() },
    { type: 'response', text: "It's okay, take a deep breath. Let's do a short exercise.", createdAt: new Date() },
  ]);

  const handleSend = (text: string) => {
    setMessages(prev => [
      ...prev,
      { type: 'prompt', text, createdAt: new Date() }
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={60}
    >
      <Header />
      <View style={styles.chatContainer}>
        <FlatList
          data={messages}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) =>
            item.type === 'response' ? (
              <ChatResponse text={item.text} time={item.createdAt} />
            ) : (
              <Message prompt={item.text} time={item.createdAt} />
            )
          }
          contentContainerStyle={styles.contentContainer}
        />
   <View style={{justifyContent: "center", width: "100%", alignItems: "center"}}>
        <ConversationTextInput onSend={handleSend} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Conversation;

