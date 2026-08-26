import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  headerRow: {
    width: "100%",
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    width: "100%",
    textAlign: "left",
    fontSize: theme.typography.fontSize.title1,
    fontWeight: "700",
    paddingVertical: 10,
    borderBottomWidth: 1,
    color: theme.colors.textPrimary,
  },
  noOfNotifications: {
    width: "100%",
    textAlign: "left",
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.subhead,
    lineHeight: 20,
    fontWeight: "400",
    color: theme.colors.textSecondary,
  },
  blueText: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  tabRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    marginBottom: 6,
  },
  tabButton: {
    borderRadius: 16,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  tabButtonInactive: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.border,
  },
  tabButtonText: {
    fontSize: theme.typography.fontSize.footnote,
    fontWeight: "600",
  },
  tabButtonTextActive: {
    color: theme.colors.primary,
  },
  tabButtonTextInactive: {
    color: theme.colors.textSecondary,
  },
  todayAndThisWeekText: {
    width: "100%",
    marginTop: theme.spacing.xl,
    marginBottom: 10,
    textAlign: "left",
    fontSize: theme.typography.fontSize.callout,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
});

export default styles;
