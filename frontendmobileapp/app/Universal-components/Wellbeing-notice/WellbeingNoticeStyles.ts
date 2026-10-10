import { StyleSheet } from "react-native";
import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primarySoft,
    minHeight: 44,
  },
  bannerIcon: {
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  bannerText: {
    flex: 1,
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },
  bannerLink: {
    color: theme.colors.primaryStrong,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    maxHeight: "85%",
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  sheetTitle: {
    fontSize: theme.typography.fontSize.title3,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  sheetIntro: {
    fontSize: theme.typography.fontSize.subhead,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  resourceText: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  resourceName: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  resourceDetail: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textMuted,
  },
  resourceAction: {
    fontSize: theme.typography.fontSize.subhead,
    fontWeight: "700",
    color: theme.colors.primaryStrong,
    maxWidth: 140,
    textAlign: "right",
  },
});

export default styles;
