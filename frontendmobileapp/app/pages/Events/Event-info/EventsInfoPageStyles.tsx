import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  indEventsContainer: {
    width: "100%",
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
  },
  pageContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 30,
  },
});

export default styles;
