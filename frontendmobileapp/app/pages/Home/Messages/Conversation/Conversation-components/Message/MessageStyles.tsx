import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  chatMessageContainer: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: theme.spacing.xs,
  },
  messageAndTimeSentContainer: {
    marginLeft: "auto",
    maxWidth: "80%",
    minWidth: "24%",
  },
  chatMessage: {
    position: "relative",
    borderRadius: theme.radii.xxl,
    borderBottomRightRadius: 10,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingTop: theme.spacing.sm,
    paddingBottom: 6,
  },
  tailSent: {
    position: "absolute",
    right: -6,
    bottom: 8,
    width: 12,
    height: 12,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primary,
    transform: [{ rotate: "-28deg" }],
  },
  messageText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.body,
    lineHeight: 21,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xxs,
  },
  timeSentMessage: {
    marginTop: theme.spacing.xxs,
    marginLeft: "auto",
    // Dimmed timestamp over the blue sent bubble — kept as a literal.
    color: "#dbe8ff",
    fontSize: 11,
  },
});

export default styles;
