import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  blogContainer: {
    display: "flex",
    width: "100%",
    backgroundColor: theme.colors.surface,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    borderRadius: 12,
    marginBottom: theme.spacing.lg,
  },
  blogImage: {
    width: "100%",
    minHeight: 170,
    maxHeight: 240,
  },
  blogTitle: {
    textAlign: "left",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginTop: 10,
    fontSize: theme.typography.fontSize.title2,
    lineHeight: 28,
    fontWeight: "600",
  },
  authorAndDateContainer: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-start",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
    flexDirection: "row",
  },
  authorContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    marginRight: 30,
  },
  authorIcon: {
    color: theme.colors.primary,
    paddingRight: 5,
  },
  dateAndAuthorText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSize.subhead,
  },
  blogSummary: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginBottom: 14,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.body,
    lineHeight: 22,
  },
});

export default styles;
