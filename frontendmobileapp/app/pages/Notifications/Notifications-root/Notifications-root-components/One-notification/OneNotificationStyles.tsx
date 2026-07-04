import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    paddingRight: 15,
    paddingLeft: 30,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    position: "absolute",
    left: 10,
  },
  activeBackgroundColor: {
    backgroundColor: theme.colors.surface,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  username: {
    fontWeight: "600",
    fontSize: theme.typography.fontSize.subhead,
    color: theme.colors.textPrimary,
  },
  usernameUnopened: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: 600,
    color: theme.colors.primary,
  },
  messageText: {
    fontSize: theme.typography.fontSize.subhead,
    color: theme.colors.textPrimary,
  },
  timeText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  postImage: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.sm,
    marginLeft: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  modalCard: {
    width: "92%",
    maxWidth: 380,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  modalBody: {
    fontSize: theme.typography.fontSize.subhead,
    color: theme.colors.textSecondary,
    marginBottom: 14,
  },
  followModalImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: "center",
    marginBottom: theme.spacing.md,
  },
  followModalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  followModalCloseButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radii.lg,
  },
  followModalCloseButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.footnote,
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  declineButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radii.lg,
  },
  declineButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.footnote,
    fontWeight: "600",
  },
  acceptButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radii.lg,
  },
  acceptButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.footnote,
    fontWeight: "700",
  },
});

export default styles;
