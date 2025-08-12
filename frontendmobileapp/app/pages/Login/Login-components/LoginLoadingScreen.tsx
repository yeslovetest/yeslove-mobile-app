import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const LoginLoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={"large"}></ActivityIndicator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});

export default LoginLoadingScreen;
