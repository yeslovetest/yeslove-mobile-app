import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  contentContainer: {
    width: "100%",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: 10,
  },
  blogText: {
    fontSize: 17,
    lineHeight: 30,
    textAlign: "left",
    color: theme.colors.textPrimary,
    letterSpacing: 0.1,
  },
  blogHeading: {
    marginTop: 10,
    marginBottom: theme.spacing.xs,
    fontSize: 21,
    lineHeight: 30,
    color: theme.colors.textPrimary,
    fontWeight: "700",
  },
});

export default styles;
