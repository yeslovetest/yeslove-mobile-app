import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 70,
    right: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    height: 42,
    width: 42,
    opacity: 0.7,
    borderRadius: 21,
    ...theme.shadows.md,
  },
  upIcon: {
    color: theme.colors.textOnPrimary,
  },
});

export default styles;
