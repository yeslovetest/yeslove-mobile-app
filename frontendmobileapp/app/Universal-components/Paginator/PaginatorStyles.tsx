import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.sm,
    marginHorizontal: 10,
  },
  disabled: {
    backgroundColor: theme.colors.disabled,
  },
  buttonText: {
    color: theme.colors.textOnPrimary,
    fontWeight: "600",
  },
  pageLabel: {
    fontSize: theme.typography.fontSize.callout,
    fontWeight: "500",
  },
});

export default styles;
