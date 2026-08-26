import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";
import { vw } from "@/ts/viewport-units";

const styles = StyleSheet.create({
  professionalProfileContainer: {
    marginTop: vw(5),
    width: "100%",
    maxWidth: 460,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.xl,
  },

  professionalProfileName: {
    marginBottom: 10,
    fontWeight: "600",
    fontSize: theme.typography.fontSize.title3,
  },

  professionalDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.body,
    textAlign: "center",
    lineHeight: 22,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: theme.colors.surface,
    marginBottom: 10,
  },
  viewProfile: {
    backgroundColor: theme.colors.primary,
    minWidth: 120,
    marginTop: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
  },
  buttonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.subhead,
  },
});

export default styles;
