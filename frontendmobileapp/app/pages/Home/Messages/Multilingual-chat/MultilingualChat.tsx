import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  fetchPersonas,
  selectPersona,
  clearPersona,
  sendMultilingualMessage,
  sendMultilingualVoice,
} from "@/app/store/Multilingual/multilingualSlice";
import { changeTabAction, TabType } from "@/app/store/Navigation/navigationSlice";
import AudioPlayer from "./AudioPlayer";
import VoiceRecordButton from "./VoiceRecordButton";
import styles from "./MultilingualChatStyles";

const PersonaPicker = () => {
  const dispatch = useAppDispatch();
  const personas = useAppSelector((state) => state.multilingual.personas);
  const status = useAppSelector((state) => state.multilingual.personasStatus);

  useEffect(() => {
    dispatch(fetchPersonas());
  }, [dispatch]);

  return (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerTitle}>Choose who you'd like to talk to</Text>
      <Text style={styles.pickerSubtitle}>
        Each persona responds in your language, mindful of the cultural context that comes with
        it.
      </Text>

      {status === "loading" && <ActivityIndicator style={{ marginTop: 24 }} />}

      <ScrollView contentContainerStyle={styles.pickerList}>
        {personas.map((persona) => (
          <TouchableOpacity
            key={persona.language}
            style={styles.personaCard}
            onPress={() => dispatch(selectPersona(persona.language))}
            accessibilityRole="button"
            accessibilityLabel={`Chat with ${persona.name}, ${persona.language_name}`}
          >
            <View style={styles.personaAvatar}>
              <Text style={styles.personaAvatarText}>{persona.name.charAt(0)}</Text>
            </View>
            <View style={styles.personaTextBlock}>
              <Text style={styles.personaName}>{persona.name}</Text>
              <Text style={styles.personaLanguage}>{persona.language_name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9aa5b1" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const MultilingualChat = () => {
  const dispatch = useAppDispatch();
  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const selectedLanguage = useAppSelector((state) => state.multilingual.selectedLanguage);
  const messages = useAppSelector((state) => state.multilingual.messages);
  const sending = useAppSelector((state) => state.multilingual.sending);
  const error = useAppSelector((state) => state.multilingual.error);
  const personas = useAppSelector((state) => state.multilingual.personas);
  const persona = personas.find((p) => p.language === selectedLanguage);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, sending]);

  const handleClose = () => {
    dispatch(changeTabAction({ type: TabType.MESSAGES }));
  };

  const handleSend = () => {
    if (!input.trim()) return;
    dispatch(sendMultilingualMessage({ text: input.trim() }));
    setInput("");
  };

  const handleVoiceRecorded = (uri: string) => {
    dispatch(sendMultilingualVoice({ uri }));
  };

  if (!selectedLanguage) {
    return (
      <View style={styles.outer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={26} color={styles.headerTitle.color as string} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat in your language</Text>
          <View style={{ width: 26 }} />
        </View>
        <PersonaPicker />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.outer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => dispatch(clearPersona())}
          accessibilityRole="button"
          accessibilityLabel="Change language"
        >
          <Ionicons name="chevron-back" size={26} color={styles.headerTitle.color as string} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{persona?.name ?? "Sera"}</Text>
          <Text style={styles.headerSubtitle}>{persona?.language_name}</Text>
        </View>
        <TouchableOpacity onPress={handleClose} accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={26} color={styles.headerTitle.color as string} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.messagesContainer}>
        {messages.map((m, idx) =>
          m.role === "user" ? (
            <View key={idx} style={styles.userBubbleRow}>
              <View style={styles.userBubble}>
                <Text style={styles.userBubbleText}>{m.text}</Text>
              </View>
            </View>
          ) : (
            <View key={idx} style={styles.botBubbleRow}>
              <View style={styles.botBubble}>
                <Text style={styles.botBubbleText}>{m.text}</Text>
                {!!m.audioBase64 && <AudioPlayer audioBase64={m.audioBase64} />}
              </View>
            </View>
          ),
        )}
        {sending && <ActivityIndicator style={{ marginTop: 12 }} />}
        {!sending && !!error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      <View style={styles.inputDock}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder={`Message ${persona?.name ?? ""}…`}
          placeholderTextColor="#9aa5b1"
          multiline
          accessibilityLabel="Message input"
        />
        <VoiceRecordButton onRecorded={handleVoiceRecorded} disabled={sending} />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default MultilingualChat;
