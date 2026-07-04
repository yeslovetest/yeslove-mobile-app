import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: theme.colors.background,
  },
  chatContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  contentContainer: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  mediaPreviewContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  inputDock: {
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
    zIndex: 20,
  },
});

export default styles;
