import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import styles from "./LoginRootStyles";
import { theme } from "@/app/theme";

type LoginRootProps = {
  showSlowLoadingHelp?: boolean;
};

const LoginRoot: React.FC<LoginRootProps> = ({ showSlowLoadingHelp = false }: LoginRootProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={"large"} color={theme.colors.primary}></ActivityIndicator>
      <Text style={styles.title}>Getting everything ready</Text>
      <Text style={styles.message}>
        {showSlowLoadingHelp
          ? "This is taking a little longer than expected. We will take you to sign in if reconnect fails."
          : "Please wait a moment while we connect you."}
      </Text>
    </View>
  );
};

export default LoginRoot;
