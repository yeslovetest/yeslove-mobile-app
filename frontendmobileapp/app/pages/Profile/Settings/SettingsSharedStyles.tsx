import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const settingsSharedStyles = StyleSheet.create({
  pageHeaderRow: {
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: theme.spacing.xxs,
  },
  pageTitle: {
    fontSize: theme.typography.fontSize.title1,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  pageSubtitle: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.subhead,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  settingsOptionContainer: {
    width: "100%",
    paddingHorizontal: theme.spacing.md,
    borderRadius: 12,
    minHeight: 58,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    ...theme.shadows.md,
  },
  settingsOptionButton: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  settingsOptionLeftRow: {
    flexDirection: "row",
    height: "100%",
    alignItems: "center",
  },
  settingsOptionText: {
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.body,
    fontWeight: "500",
  },
});

export default settingsSharedStyles;
