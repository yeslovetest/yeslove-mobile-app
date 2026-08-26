import { StyleSheet, Dimensions } from "react-native";

import { theme } from "@/app/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const fontSize = Math.min(Math.max(SCREEN_WIDTH * 0.038, 14), 17);

const styles = StyleSheet.create({
  commentContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    width: "100%",
  },
  postCommentContainer: {
    width: "100%",
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  commentBox: {
    flex: 1,
    minHeight: 46,
    maxHeight: 118,
    borderWidth: 1,
    borderColor: theme.colors.border,
    outlineColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    fontSize,
    lineHeight: Math.round(fontSize * 1.45),
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  commentProfileImage: {
    width: 45,
    height: 45,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xxs,
  },
  submitCommentButton: {
    minWidth: 84,
    height: 42,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    opacity: 0.95,
    paddingHorizontal: 14,
    marginBottom: theme.spacing.xxs,
  },
  submitCommentButtonDisabled: {
    opacity: 0.55,
  },
  submitCommentButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize,
    fontWeight: "600",
  },
});

export default styles;
