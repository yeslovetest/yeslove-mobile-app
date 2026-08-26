import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  indBlogContainer: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  indBlogTitle: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.typography.fontSize.display,
    lineHeight: 36,
    color: theme.colors.textPrimary,
    fontWeight: "700",
  },
  indAuthorAndDateContainer: {
    width: "100%",
    justifyContent: "flex-start",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
  },
  blogImage: {
    width: "100%",
    minHeight: 220,
    maxHeight: 300,
  },
  blogImageContent: {
    borderRadius: 0,
    resizeMode: "cover",
  },
  authorContainer: {
    alignItems: "center",
    flexDirection: "row",
    maxWidth: "100%",
  },
  authorIcon: {
    color: theme.colors.primary,
    paddingRight: 7,
  },
  dateAndAuthorText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.subhead,
    lineHeight: 18,
    fontWeight: "500",
  },
});

export default styles;
