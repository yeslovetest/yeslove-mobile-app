import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    flexDirection: "row",
  },
  icon: {
    color: theme.colors.textOnPrimary,
    marginRight: theme.spacing.sm,
  },
  chatbotButton: {
    width: "95%",
    flexDirection: "row",
    paddingVertical: 10,
    paddingRight: theme.spacing.md,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    alignItems: "flex-start",
    paddingLeft: 10,
    justifyContent: "flex-start",
  },
  chatbotButtonText: {
    flex: 1,
    flexShrink: 1,
    fontSize: theme.typography.fontSize.body,
    lineHeight: 21,
    fontWeight: "600",
    color: theme.colors.textOnPrimary,
  },
});

export default styles;
