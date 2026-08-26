import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  navBarContainer: {
    flex: 0,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    marginBottom: 6,
    width: "100%",
  },
  navBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    ...theme.shadows.md,
  },
  navItem: {
    width: "50%",
    paddingVertical: 11,
    alignItems: "center",
  },
  navText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textMuted,
    fontWeight: "500",
  },
  activeNavItem: {
    position: "relative",
  },
  activeNavText: {
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  activeIndicator: {
    width: 40,
    height: 3,
    backgroundColor: theme.colors.primary,
    position: "absolute",
    bottom: -2,
  },
});

export default styles;
