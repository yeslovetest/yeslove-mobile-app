import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";
import { vw } from "@/ts/viewport-units";

const styles = StyleSheet.create({
  homeNavBarContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: vw(5),
    marginBottom: vw(5),
  },
  homeNavBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: theme.layout.postWidth,
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    ...theme.shadows.md,
  },
  indPostNavBarContainer: {
    marginTop: 1,
    marginBottom: 1,
    borderRadius: 0,
  },
  indPostNavBar: {
    borderRadius: 0,
  },
  homeItem: {
    width: "50%",
    paddingVertical: 15,
    alignItems: "center",
  },
  activeHomeItem: {
    position: "relative",
  },
  activeHomeNavText: {
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
  navText: {
    fontSize: theme.typography.fontSize.callout,
    color: theme.colors.textMuted,
    fontWeight: "500",
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
