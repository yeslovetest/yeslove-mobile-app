import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexDirection: "row",
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xxs,
    width: "100%",
    backgroundColor: theme.colors.surface,
  },
  mainText: {
    fontSize: theme.typography.fontSize.body,
    backgroundColor: theme.colors.surface,
  },
  outerBox: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderBlockColor: theme.colors.textPrimary,
    height: 20,
    width: 20,
    padding: theme.spacing.xxs,
  },
  innerBox: {
    backgroundColor: theme.colors.textPrimary,
    height: "100%",
    width: "100%",
  },
  settingsNavItemContent: {
    alignItems: "center",
    paddingVertical: 15,
    marginVertical: theme.spacing.xxs,
    paddingHorizontal: 50,
    backgroundColor: theme.colors.surface,
  },
  headerText: {
    backgroundColor: theme.colors.surface,
    fontSize: theme.typography.fontSize.body,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: theme.colors.textPrimary,
    fontWeight: "bold",
  },
  headerText2: {
    paddingVertical: 10,
    fontSize: 17,
    paddingHorizontal: 0,
  },
});

export default styles;
