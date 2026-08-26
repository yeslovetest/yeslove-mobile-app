import styles from "../SharedChatbotStyles";
import GreetingContainer from "./GreetingContainer";
import { LinearGradient } from "expo-linear-gradient";
import ChatPrompt from "./ChatPrompt";
import ChatResponse from "./ChatResponse";
import React, { useRef, useEffect } from "react";
import { ScrollView, View } from "react-native";
import LoadingAnimation from "./LoadingAnimation";

const ChatScrollView = ({ loading, messages }) => {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length, loading]);

  return (
    <ScrollView
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentContainer}
      style={styles.container}
    >
      <View style={styles.backgroundContainer}>
        <LinearGradient style={styles.background} colors={["#b8e0fc", "transparent"]}>
          {messages.length === 0 ? (
            <GreetingContainer />
          ) : (
            <>
              {messages.map((m, idx) =>
                m.role === "user" ? (
                  <ChatPrompt key={idx} prompt={m.text} time={m.createdAt} />
                ) : (
                  <ChatResponse key={idx} text={m.text} time={m.createdAt} />
                ),
              )}
              {loading && <LoadingAnimation />} {/* dots after last message */}
            </>
          )}
        </LinearGradient>
      </View>
    </ScrollView>
  );
};

export default ChatScrollView;
