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
  saveButton: {
    width: 100,
    paddingVertical: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    marginBottom: 50,
  },
  saveButtonText: {
    color: theme.colors.textOnPrimary,
    textAlign: "center",
    fontSize: 19,
  },
  mainHeaderText: {
    backgroundColor: theme.colors.surface,
    fontSize: theme.typography.fontSize.body,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: theme.colors.textPrimary,
    fontWeight: "bold",
  },
  headerText2: {
    paddingVertical: 10,
    fontSize: 17,
    paddingHorizontal: 0,
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
  sectionText: {
    textAlign: "center",
    fontSize: theme.typography.fontSize.body,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
});

export default styles;
