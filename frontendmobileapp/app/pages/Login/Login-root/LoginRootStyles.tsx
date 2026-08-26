import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  title: {
    marginTop: theme.spacing.lg,
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  message: {
    marginTop: 10,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 360,
  },
});

export default styles;
