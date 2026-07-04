import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  userPostBoxContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  postInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.callout,
    textAlignVertical: "top",
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.lg,
    outlineColor: theme.colors.surface,
  },
  postIcons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    gap: 14,
  },
  mediaActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceAlt,
  },
  validationMessage: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.footnote,
    color: theme.colors.danger,
    lineHeight: 18,
  },
});

export default styles;
