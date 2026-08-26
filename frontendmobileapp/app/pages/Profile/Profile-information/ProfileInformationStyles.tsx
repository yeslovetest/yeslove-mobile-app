import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: theme.colors.surfaceAlt,
  },
  contentContainer: {
    width: "100%",
    paddingTop: 14,
    paddingBottom: theme.spacing.xxxl,
    paddingHorizontal: 14,
  },
  headerRow: {
    width: "100%",
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    fontWeight: "700",
  },
  pageSubtitle: {
    marginTop: 6,
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSize.subhead,
    lineHeight: 20,
  },
  viewItemContainer: {
    backgroundColor: theme.colors.surface,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    width: "100%",
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  viewItemText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: "700",
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  fieldIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primarySoft,
  },
  fieldIcon: {
    color: theme.colors.primary,
  },
  viewItemInfo: {
    width: "100%",
    paddingVertical: theme.spacing.xxs,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.callout,
    fontWeight: "600",
    lineHeight: 22,
  },

  /* Friends list */

  friend: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  activeIndicator: {
    width: 40,
    height: 3,
    backgroundColor: theme.colors.primary,
    position: "absolute",
    bottom: -2,
  },
  friendName: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  friendsContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  friends: {
    flexDirection: "column",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "flex-start",
    backgroundColor: theme.colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radii.lg,
    ...theme.shadows.md,
  },
  friendsItem: {
    width: "100%",
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 10,
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  activeFriendsText: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
    fontSize: 17,
  },
  friendsText: {
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
});

export default styles;
