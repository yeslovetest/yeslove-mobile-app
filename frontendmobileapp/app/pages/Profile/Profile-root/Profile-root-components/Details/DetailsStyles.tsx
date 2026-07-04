import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "flex-start",
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  detailsText: {
    marginBottom: 10,
    fontSize: 17,
    fontWeight: "700",
  },
  viewInformationText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.subhead,
    fontWeight: "500",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    paddingVertical: theme.spacing.xxs,
  },
  icon: {
    marginRight: theme.spacing.sm,
    paddingTop: 0,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.title2,
  },
  buttonContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: theme.colors.primary,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: theme.radii.xl,
    ...theme.shadows.sm,
  },
  buttonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.subhead,
    fontWeight: "600",
  },
});

export default styles;
