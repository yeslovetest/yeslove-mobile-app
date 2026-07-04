import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingTop: theme.spacing.sm,
    paddingHorizontal: 10,
  },
  contentContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingBottom: theme.spacing.xxl,
  },
});

export default sharedStyles;
