import React, { useRef, useEffect, useState } from 'react';
import { Animated, View, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import ChatbotScrollView from './ChatbotScrollView';
import TextInputContainer from './Chatbot-components/TextInputContainer';
import styles from './SharedChatbotStyles';
import Header from '@/app/Universal-components/Header/Header';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { sendChatbotMessage } from '@/app/store/Chat/chatSlice';

const Chatbot = () => {

  const dispatch = useAppDispatch();
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; createdAt?: Date }[]>([]);
  const [loading, setLoading] = useState(false);
  const screenHeight = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const chatBotResponse = useAppSelector((state) => state.chat.chatbotResponse.response ?? "");
  const chatBotResponseSources = useAppSelector((state) => state.chat.chatbotResponse.sources ?? "");

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const postPrompt = async (prompt: string) => {
    setLoading(true);

    const now = new Date();

    setMessages((prev) => [
      ...prev,
      { role: "user", text: prompt, createdAt: now },
    ]);

    dispatch(sendChatbotMessage({ prompt }));
  };

  useEffect(() => {
    if (!chatBotResponse) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        text: `${chatBotResponse}. Sources: ${chatBotResponseSources}`,
        createdAt: new Date(),
      },
    ]);

    setLoading(false);
  }, [chatBotResponse, chatBotResponseSources]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    postPrompt(text.trim());
  };

  return (
    <Animated.View
      style={[
        styles.outerView,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Header />
      <KeyboardAvoidingView
        style={styles.chatBody}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={60}
      >
        <ChatbotScrollView messages={messages} loading={loading} />
        <View style={styles.chatInputDock}>
          <TextInputContainer onSend={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

export default Chatbot;
