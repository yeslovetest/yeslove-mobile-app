import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 14,
  },
  postCard: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: 10,
    ...theme.shadows.sm,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    marginRight: 10,
  },
  authorInfo: {
    flexDirection: "column",
    justifyContent: "center",
  },
  authorName: {
    fontSize: theme.typography.fontSize.subhead,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  timeText: {
    marginTop: theme.spacing.xxs,
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textMuted,
  },
  contentText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.subhead,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  mediaWrap: {
    width: "100%",
    marginBottom: theme.spacing.sm,
  },
  footerRow: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerMetric: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  centerState: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  stateText: {
    fontSize: theme.typography.fontSize.footnote,
    color: theme.colors.textSecondary,
  },
  endText: {
    fontSize: theme.typography.fontSize.footnote,
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  errorText: {
    fontSize: theme.typography.fontSize.footnote,
    color: theme.colors.danger,
    textAlign: "center",
  },
});

export default styles;
