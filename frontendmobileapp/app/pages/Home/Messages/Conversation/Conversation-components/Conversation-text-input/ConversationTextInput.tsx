import React, { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import styles from "./ConversationTextInputStyles";
import { theme } from "@/app/theme";
import { TextInput, View } from "react-native";

interface Props {
  onSend?: (text: string) => void;
  openMedia?: (type: string) => void;
}

const ConversationTextInput = (props: Props) => {
  const [text, setText] = useState("");
  const MIN_INPUT_HEIGHT = 34;
  const MAX_INPUT_HEIGHT = 120;
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const isSendDisabled = text.trim().length === 0;

  const send = (msg: string) => {
    const trimmed = msg.trim();
    if (trimmed) {
      props.onSend?.(trimmed);
      setText("");
      setInputHeight(MIN_INPUT_HEIGHT);
    }
  };

  const selectMedia = (type: string) => {
    if (type === "media") {
      // Allow both images and videos
      props.openMedia?.(type);
    }
  };

  return (
    <View style={styles.textInputContainer}>
      <Ionicons
        onPress={() => selectMedia("media")}
        style={styles.mediaIcon}
        name="camera-outline"
        size={18}
      />
      <TextInput
        style={[
          styles.textInput,
          {
            height: Math.max(MIN_INPUT_HEIGHT, Math.min(MAX_INPUT_HEIGHT, inputHeight)),
            outlineWidth: 0,
            outlineColor: "transparent",
          },
        ]}
        placeholder="Type message"
        placeholderTextColor={theme.colors.textMuted}
        value={text}
        onChangeText={setText}
        onContentSizeChange={(event) => {
          const nextHeight = event.nativeEvent.contentSize.height;
          setInputHeight(Math.max(MIN_INPUT_HEIGHT, Math.min(MAX_INPUT_HEIGHT, nextHeight)));
        }}
        blurOnSubmit={false}
        multiline
      />

      <Ionicons
        onPress={() => {
          if (!isSendDisabled) {
            send(text);
          }
        }}
        style={[styles.sendIcon, isSendDisabled && styles.sendIconDisabled]}
        name="send"
        size={18}
      />
    </View>
  );
};

export default ConversationTextInput;
