import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  settingsNavItemContainer: {
    width: theme.layout.contentWidth,
    borderTopWidth: 0.5,
    borderBlockColor: theme.colors.borderStrong,
    marginVertical: 5,
  },
  settingsNavItemContent: {
    alignItems: "center",
    paddingVertical: 15,
    marginVertical: theme.spacing.xxs,
    paddingHorizontal: 50,
    backgroundColor: theme.colors.surface,
  },
  sectionText: {
    textAlign: "center",
    fontSize: theme.typography.fontSize.body,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  settingsSubSection: {
    padding: theme.spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBlockColor: theme.colors.textMuted,
    backgroundColor: theme.colors.surface,
  },
  subSectionInput: {
    fontSize: theme.typography.fontSize.body,
    borderWidth: 1,
    borderBottomColor: theme.colors.textMuted,
    color: theme.colors.textMuted,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 10,
    marginVertical: 10,
    width: "100%",
    borderRadius: theme.radii.lg,
  },
  saveChangesButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    margin: theme.spacing.xl,
    borderRadius: theme.radii.lg,
  },
  saveChangesButtonText: {
    color: theme.colors.textOnPrimary,
    textAlign: "center",
    fontSize: theme.typography.fontSize.body,
  },

  /* modal */

  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
  },
  modalText: {
    fontSize: theme.typography.fontSize.title3,
    textAlign: "center",
  },
});

export default styles;
