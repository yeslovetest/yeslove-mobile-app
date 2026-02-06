import React, { useEffect, useRef } from 'react'
import { View, Text, ScrollView } from 'react-native'
import styles from './SharedChatbotStyles'
import ChatResponse from './Chatbot-components/ChatResponse'
import { LinearGradient } from 'expo-linear-gradient'
import ChatPrompt from './Chatbot-components/ChatPrompt'
import GreetingContainer from './Chatbot-components/GreetingContainer'
import LoadingAnimation from './Chatbot-components/LoadingAnimation'

type ChatbotScrollViewProps = {
  loading: boolean
  messages: { role: 'user' | 'bot'; text: string }[]
}


const ChatbotScrollView: React.FC<ChatbotScrollViewProps> = ({ loading = false, messages = [] } ) => {
const scrollRef = useRef<ScrollView>(null);

useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  
  }, [messages.length, loading]);
  
  return (

          <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.contentContainer} style={styles.container}>
            <View style={styles.backgroundContainer}>
              <View style={styles.background}>
                {messages.length === 0 ? (
                <GreetingContainer />
              ) : (
                <>
                  {messages.map((m, idx ) =>
                    m.role === 'user' ? (
                      <ChatPrompt   key={idx} prompt={m.text} time={m.createdAt} />
                    ) : (
                      <ChatResponse key={idx} text={m.text} time={m.createdAt} />
                    )
                  )}
      
                  {loading && <LoadingAnimation />}  {/* dots after last message */}
                </>
              )}
              </View>
            </View>
          </ScrollView>
  )
}

export default ChatbotScrollView
