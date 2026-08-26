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
    paddingBottom: 34,
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
    fontSize: theme.typography.fontSize.subhead,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  saveButton: {
    width: "100%",
    minHeight: 52,
    paddingVertical: 13,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.xl,
    marginTop: 14,
    marginBottom: 18,
    ...theme.shadows.md,
  },
  saveButtonText: {
    color: theme.colors.textOnPrimary,
    textAlign: "center",
    fontSize: theme.typography.fontSize.callout,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  displayMsgBox: {
    width: "100%",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
  },
  displayMsgText: {
    color: theme.colors.primary,
    textAlign: "center",
    fontSize: theme.typography.fontSize.body,
    fontWeight: "600",
  },
});

export default styles;
