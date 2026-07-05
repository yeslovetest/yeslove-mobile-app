import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  editItemContainer: {
    backgroundColor: theme.colors.surface,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    marginBottom: theme.spacing.md,
    width: "100%",
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  editItemText: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  editItemInfo: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    width: "100%",
    minHeight: 46,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.body,
    fontWeight: "500",
  },
  editItemInfoMultiline: {
    minHeight: 92,
    textAlignVertical: "top",
  },
});

export default styles;
