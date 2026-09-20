import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import styles from "./AskChatbotButtonStyles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Props = {
  onClick: () => void;
  label?: string;
  iconName?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

const AskChatbotButton = ({
  onClick,
  label = "Need support right now? Chat with Sera",
  iconName = "account-heart-outline",
}: Props) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.chatbotButton}>
        <MaterialCommunityIcons name={iconName} size={24} style={styles.icon} />
        <Text style={styles.chatbotButtonText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default AskChatbotButton;
