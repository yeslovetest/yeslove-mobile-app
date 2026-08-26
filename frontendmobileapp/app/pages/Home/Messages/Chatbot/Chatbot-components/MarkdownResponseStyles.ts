import { theme } from "@/app/theme";

/* markdown response styles for chatbot answers, used in ChatResponse component */
const markdownStyles = {
  body: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.body,
    lineHeight: 23,
  },
  heading1: {
    fontSize: theme.typography.fontSize.title2,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 14,
    color: theme.colors.textPrimary,
  },
  heading2: {
    fontSize: theme.typography.fontSize.title3,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
    marginTop: 10,
    color: theme.colors.textPrimary,
  },
  heading3: {
    fontSize: theme.typography.fontSize.callout,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  paragraph: {
    marginBottom: 10,
  },
  strong: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  em: {
    fontStyle: "italic",
    color: theme.colors.textSecondary,
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: "underline",
  },
  bullet_list: {
    marginBottom: 10,
    paddingLeft: theme.spacing.xxs,
  },
  ordered_list: {
    marginBottom: 10,
    paddingLeft: theme.spacing.xxs,
  },
  list_item: {
    flexDirection: "row",
    marginBottom: 6,
  },
  blockquote: {
    borderLeftWidth: 3,
    // Light-blue blockquote accent — kept as a literal.
    borderLeftColor: "#bfdbfe",
    backgroundColor: theme.colors.surfaceAlt,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 10,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
  },
  code_inline: {
    backgroundColor: theme.colors.primarySoft,
    // Indigo inline-code text — kept as a literal.
    color: "#3730a3",
    paddingHorizontal: 6,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radii.sm,
    fontSize: theme.typography.fontSize.footnote,
  },
  code_block: {
    // Dark code-block theme — kept as literals.
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
    marginVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.footnote,
  },
  fence: {
    // Dark code-block theme — kept as literals.
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
    marginVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.footnote,
  },
  hr: {
    backgroundColor: theme.colors.border,
    height: 1,
    marginVertical: theme.spacing.md,
  },
};

export default markdownStyles;
