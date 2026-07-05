import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

// Pass A tokenization: values that have an exact token equivalent use the token;
// values with no exact token in the scale are kept as literals so the rendered
// output is byte-identical to before.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  compactContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  innerContainer: {
    width: "100%",
    maxWidth: theme.layout.maxFormWidth,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 22,
    borderRadius: theme.radii.xxl,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: theme.colors.primary,
    borderBottomWidth: 3,
    alignSelf: "center",
  },
  compactInnerContainer: {
    paddingHorizontal: 14,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radii.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.title1,
    fontWeight: "bold",
    marginBottom: 14,
    color: theme.colors.primary,
    letterSpacing: 0.5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  compactTitle: {
    fontSize: theme.typography.fontSize.title2,
    marginBottom: 10,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: theme.typography.fontSize.body,
    fontWeight: "600",
    marginBottom: 6,
    color: theme.colors.primary,
  },
  compactLabel: {
    fontSize: theme.typography.fontSize.subhead,
    marginBottom: theme.spacing.xs,
  },
  errorMessage: {
    width: "100%",
    textAlign: "center",
    fontSize: theme.typography.fontSize.subhead,
    marginBottom: 10,
    minHeight: 20,
    color: theme.colors.danger,
    fontWeight: "600",
  },
  compactErrorMessage: {
    fontSize: theme.typography.fontSize.footnote,
    marginBottom: theme.spacing.sm,
    minHeight: 18,
  },
  modeToggleContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.sm,
    marginBottom: 14,
  },
  compactModeToggleContainer: {
    marginBottom: 10,
  },
  modeToggleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceAlt,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  modeToggleButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  modeToggleText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSize.subhead,
    fontWeight: "600",
  },
  modeToggleTextActive: {
    color: theme.colors.primary,
  },
  input: {
    width: "100%",
    height: 48,
    borderColor: theme.colors.border,
    borderBottomColor: theme.colors.primary,
    borderBottomWidth: 2,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  compactInput: {
    height: 44,
    marginBottom: 10,
  },
  helperText: {
    alignSelf: "flex-start",
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSize.caption,
    lineHeight: 17,
    marginTop: -4,
    marginBottom: 10,
  },
  compactHelperText: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: theme.spacing.sm,
  },
  button: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.sm,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  compactButton: {
    paddingVertical: 10,
    marginTop: 6,
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.body,
    fontWeight: "bold",
  },
  compactButtonText: {
    fontSize: theme.typography.fontSize.subhead,
  },

  containerFooter: {
    textAlign: "center",
    color: theme.colors.textMuted,
    marginTop: 18,
    paddingTop: 10,
    fontSize: theme.typography.fontSize.subhead,
    lineHeight: 20,
    borderTopWidth: 1,
    borderColor: theme.colors.borderStrong,
    width: "100%",
  },
  compactContainerFooter: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.footnote,
    lineHeight: 18,
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
});

export default styles;
