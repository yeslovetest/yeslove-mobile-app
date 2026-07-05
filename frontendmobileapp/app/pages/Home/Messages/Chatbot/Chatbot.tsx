import React, { useRef, useEffect, useState } from "react";
import { Animated, View, Dimensions, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatbotScrollView from "./ChatbotScrollView";
import TextInputContainer from "./Chatbot-components/TextInputContainer";
import styles from "./SharedChatbotStyles";
import Header from "@/app/Universal-components/Header/Header";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { sendChatbotMessage } from "@/app/store/Chat/chatSlice";

const Chatbot = () => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string; createdAt: Date }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const streamSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screenHeight = Dimensions.get("window").height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const chatBotResponse = useAppSelector((state) => state.chat.chatbotResponse.response ?? "");
  const chatBotResponseSources = useAppSelector(
    (state) => state.chat.chatbotResponse.sources ?? "",
  );
  const chatBotResponseUpdatedAt = useAppSelector(
    (state) => state.chat.chatbotResponse.updated_at ?? 0,
  );

  const formatSources = (sources: unknown): string => {
    if (!sources) {
      return "";
    }

    if (Array.isArray(sources)) {
      return sources
        .map((item) => String(item ?? ""))
        .filter(Boolean)
        .join(", ");
    }

    if (typeof sources === "string") {
      return sources.trim();
    }

    return String(sources);
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    return () => {
      if (streamSettleTimerRef.current) {
        clearTimeout(streamSettleTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const postPrompt = async (prompt: string) => {
    setLoading(true);

    const now = new Date();

    setMessages((prev) => [...prev, { role: "user", text: prompt, createdAt: now }]);

    dispatch(sendChatbotMessage({ prompt }));
  };

  useEffect(() => {
    if (!chatBotResponseUpdatedAt) return;

    if (!chatBotResponse) {
      setLoading(false);
      return;
    }

    const formattedSources = formatSources(chatBotResponseSources);
    const responseText = String(chatBotResponse);
    const botText = formattedSources
      ? `${responseText}\n\nSources: ${formattedSources}`
      : responseText;

    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.role === "bot") {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...lastMessage,
          text: botText,
        };
        return updated;
      }

      return [
        ...prev,
        {
          role: "bot",
          text: botText,
          createdAt: new Date(),
        },
      ];
    });

    if (streamSettleTimerRef.current) {
      clearTimeout(streamSettleTimerRef.current);
    }
    // Keep spinner active during rapid stream deltas; hide after stream settles.
    streamSettleTimerRef.current = setTimeout(() => {
      setLoading(false);
    }, 350);
  }, [chatBotResponse, chatBotResponseSources, chatBotResponseUpdatedAt]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    postPrompt(text.trim());
  };

  return (
    <Animated.View style={[styles.outerView, { transform: [{ translateY: slideAnim }] }]}>
      <Header />
      <KeyboardAvoidingView
        style={styles.chatBody}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ChatbotScrollView messages={messages} loading={loading} />
        <View
          style={[
            styles.chatInputDock,
            // Lift the dock above the keyboard edge (accounts for the bottom
            // safe-area / gesture nav inset) so the keyboard can't cover it.
            { marginBottom: keyboardHeight > 0 ? Math.max(insets.bottom, 8) : 0 },
          ]}
        >
          <TextInputContainer onSend={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

export default Chatbot;
