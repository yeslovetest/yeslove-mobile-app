import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    minHeight: 64,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
  },
  iconContainer: {
    width: "20%",
    minHeight: 48,
    justifyContent: "center",
    paddingBottom: theme.spacing.xxs,
    alignItems: "center",
  },
  activeIcon: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.title1,
  },
  icon: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    display: "flex",
    paddingBottom: 3,
  },
  footerText: {
    fontSize: 11,
    marginTop: theme.spacing.xxs,
    color: theme.colors.textMuted,
  },
  activeText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  newNotification: {
    position: "absolute",
    top: -2,
    left: 12,
    width: 12,
    height: 12,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primary,
  },
});

export default styles;
