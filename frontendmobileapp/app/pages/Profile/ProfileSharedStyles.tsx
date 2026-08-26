import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingTop: 10,
    paddingHorizontal: 10,
    alignSelf: "center",
    backgroundColor: theme.colors.surfaceAlt,
  },
  contentContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingBottom: 28,
  },
  heroSection: {
    width: "100%",
    marginBottom: 10,
  },
  detailsSection: {
    width: "100%",
    marginBottom: theme.spacing.sm,
  },
  tabSection: {
    width: "100%",
    marginTop: theme.spacing.xs,
    marginBottom: 10,
    paddingHorizontal: theme.spacing.xxs,
  },
  contentSection: {
    width: "100%",
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
});

export default sharedStyles;
