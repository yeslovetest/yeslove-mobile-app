import React, { useRef, useEffect, useState } from 'react';
import { Animated, Dimensions } from 'react-native';
import ChatbotScrollView from './Chatbot-components/ScrollView/ChatbotScrollView';
import TextInputContainer from './Chatbot-components/Text-input/TextInputContainer';
import styles from './SharedChatbotStyles';
import Header from '@/app/Universal-components/Header/Header';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { sendChatbotMessage } from '@/app/store/Chat/chatSlice';

const ChatbotRoot = () => {
  const dispatch = useAppDispatch();
  
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; createdAt?: Date }[]>([]);
  const [loading, setLoading] = useState(false);
  const screenHeight = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const chatBotResponse = useAppSelector((state) => state.chat.chatbotResponse);

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
    setMessages((prev) => [...prev, { role: 'user', text: prompt, createdAt: now }]);
    dispatch(sendChatbotMessage({prompt: prompt}));

    try {
      const res = await fetch('http://localhost:8080/demo-1.0-SNAPSHOT/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const json = await res.json();
      const reply = json.response ?? json;

      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: chatBotResponse, createdAt: new Date() },
      ]);
    } catch (err) {
      console.error('error:', err);
    } finally {
      setLoading(false);
    }
  };

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
      <ChatbotScrollView messages={messages} loading={loading} />
      <TextInputContainer onSend={handleSend} />
    </Animated.View>
  );
};

export default ChatbotRoot;
