import React, { useEffect, useRef } from 'react'
import { View, ScrollView } from 'react-native'
import ChatResponse from '../Response/ChatResponse'
import ChatPrompt from '../Prompt/ChatPrompt'
import styles from './ChatbotScrollViewStyles'
import Greeting from '../Greeting/Greeting'
import LoadingAnimation from '../Loading-animation/LoadingAnimation'

type ChatbotScrollViewProps = {
  loading: boolean
  messages: { role: 'user' | 'bot'; text: string }[]
}


const ChatbotScrollView: React.FC<ChatbotScrollViewProps> = ({ loading = false, messages = [] }) => {
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
            <Greeting />
          ) : (
            <>
              {messages.map((m, idx) =>
                m.role === 'user' ? (
                  <ChatPrompt key={idx} prompt={m.text} time={m.createdAt} />
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
