import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 48,
    borderColor: theme.colors.border,
    borderBottomColor: theme.colors.primary,
    borderBottomWidth: 2,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.body,
  },
});

export default styles;
