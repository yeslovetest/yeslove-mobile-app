import React from "react";
import { ActivityIndicator, View } from "react-native";
import styles from "./LoginRootStyles";

const LoginRoot = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={"large"}></ActivityIndicator>
    </View>
  );
};


export default LoginRoot
