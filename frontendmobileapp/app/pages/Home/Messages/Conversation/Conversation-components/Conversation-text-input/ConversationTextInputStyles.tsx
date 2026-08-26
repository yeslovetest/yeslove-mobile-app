import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  textInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minHeight: 48,
    maxWidth: 620,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radii.xxl,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 34,
    maxHeight: 120,
    fontSize: theme.typography.fontSize.body,
    lineHeight: 20,
    color: theme.colors.textPrimary,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
    textAlignVertical: "top",
    includeFontPadding: false,
  },
  sendIcon: {
    padding: theme.spacing.sm,
    color: theme.colors.textOnPrimary,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  },
  sendIconDisabled: {
    color: theme.colors.textOnPrimary,
    backgroundColor: theme.colors.disabled,
  },
  mediaIcon: {
    padding: theme.spacing.sm,
    marginRight: 6,
    color: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 20,
  },
});

export default styles;
