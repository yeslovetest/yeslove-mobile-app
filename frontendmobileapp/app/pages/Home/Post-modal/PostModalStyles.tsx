import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    width: "100%",
    height: "92%",
    borderTopLeftRadius: theme.radii.xxl,
    borderTopRightRadius: theme.radii.xxl,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: theme.spacing.sm,
  },
  exitHeader: {
    width: "100%",
    paddingHorizontal: theme.spacing.xxs,
    minHeight: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  closeIcon: {
    padding: theme.spacing.xxs,
  },
  createPost: {
    color: theme.colors.textPrimary,
    fontSize: 19,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: theme.spacing.sm,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 6,
    flexShrink: 1,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  actionButtons: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radii.md,
    minHeight: 36,
  },
  actionButtonsText: {
    textAlign: "center",
    fontWeight: "600",
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.caption,
  },
  modalBody: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
});

export default styles;
