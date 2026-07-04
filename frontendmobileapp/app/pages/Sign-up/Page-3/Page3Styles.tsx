import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  innerContainer: {
    width: "100%",
    maxWidth: theme.layout.maxFormWidth,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    borderRadius: theme.radii.xxl,
    alignItems: "center",
    borderBottomColor: theme.colors.primary,
    borderBottomWidth: 3,
    alignSelf: "center",
  },
  title: {
    fontSize: theme.typography.fontSize.title1,
    fontWeight: "bold",
    marginTop: theme.spacing.xxs,
    marginBottom: 14,
    color: theme.colors.textPrimary,
    textAlign: "center",
    letterSpacing: 0.4,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: theme.typography.fontSize.body,
    lineHeight: 22,
    marginBottom: 18,
    textAlign: "center",
    color: theme.colors.textPrimary,
  },

  baseButton: {
    width: "100%",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.md,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: theme.colors.primary,
  },
  baseButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.body,
    textAlign: "center",
    fontWeight: "bold",
  },

  disabledButton: {
    opacity: 0.65,
  },

  retryIndicatorRow: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },

  retryIndicatorText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.subhead,
    fontWeight: "600",
  },

  backButton: {
    backgroundColor: theme.colors.surface,
  },

  backButtonText: {
    color: theme.colors.primary,
  },
});

export default styles;
