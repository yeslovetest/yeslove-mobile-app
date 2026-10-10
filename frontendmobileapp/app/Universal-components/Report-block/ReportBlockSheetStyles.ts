import { StyleSheet } from "react-native";
import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: theme.colors.overlay,
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowIcon: {
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.md,
  },
  rowText: {
    fontSize: theme.typography.fontSize.callout,
    color: theme.colors.textPrimary,
  },
  dangerIcon: {
    color: theme.colors.danger,
    marginRight: theme.spacing.md,
  },
  dangerText: {
    fontSize: theme.typography.fontSize.callout,
    color: theme.colors.danger,
    fontWeight: "600",
  },
  cancelRow: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.sm,
  },
  cancelText: {
    fontSize: theme.typography.fontSize.callout,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  reasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    marginBottom: theme.spacing.xs,
  },
  reasonTitle: {
    fontSize: theme.typography.fontSize.title3,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  spinner: {
    marginVertical: theme.spacing.sm,
  },
  footnote: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
});

export default styles;
