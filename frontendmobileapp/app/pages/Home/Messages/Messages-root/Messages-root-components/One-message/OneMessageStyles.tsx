import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: theme.spacing.sm,
    minHeight: 84,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activeIndicator: {
    height: "100%",
    width: 7,
    backgroundColor: theme.colors.primary,
    position: "absolute",
    left: -2,
  },
  activeBackgroundColor: {
    backgroundColor: theme.colors.surface,
  },
  profilePicture: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
  },
  messageContainer: {
    flex: 1,
    paddingRight: theme.spacing.sm,
    justifyContent: "center",
  },
  userUnopened: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  userOpened: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: "500",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xxs,
  },
  messageUnopened: {
    fontWeight: "600",
    marginBottom: theme.spacing.xxs,
    color: theme.colors.textPrimary,
  },
  messageOpened: {
    fontWeight: "400",
    color: theme.colors.textMuted,
  },
  timeContainer: {
    width: 78,
    alignItems: "flex-end",
  },
  time: {
    color: theme.colors.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
});

export default styles;
