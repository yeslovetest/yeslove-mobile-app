import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  mediumContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.xxs,
    borderRadius: 12,
    overflow: "hidden",
    // Dark backdrop behind a media thumbnail while it loads — kept as a literal.
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageMedium: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.surfaceAlt,
  },
  videoMedium: {
    width: "100%",
    height: "100%",
    // Near-black video backdrop — kept as a literal.
    backgroundColor: "#020817",
  },
});

export default styles;
