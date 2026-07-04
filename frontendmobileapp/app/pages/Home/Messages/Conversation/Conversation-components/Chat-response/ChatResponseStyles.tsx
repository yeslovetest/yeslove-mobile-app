import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  chatResponseContainer: {
    width: "100%",
    paddingLeft: 0,
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.xxs,
  },
  bubbleWrap: {
    flexShrink: 1,
    maxWidth: "78%",
  },
  chatResponse: {
    position: "relative",
    width: "100%",
    alignSelf: "flex-start",
    borderRadius: theme.radii.xxl,
    borderBottomLeftRadius: 10,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    // Light-blue received-bubble border — kept as a literal.
    borderColor: "#d9e6ff",
    paddingHorizontal: 10,
    paddingTop: theme.spacing.sm,
    paddingBottom: 6,
  },
  tailReceived: {
    position: "absolute",
    left: -6,
    bottom: 8,
    width: 12,
    height: 12,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primarySoft,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#d9e6ff",
    transform: [{ rotate: "28deg" }],
  },
  responseText: {
    fontSize: theme.typography.fontSize.body,
    lineHeight: 21,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xxs,
  },
  timeSentResponseContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  timeSentResponse: {
    marginTop: theme.spacing.xxs,
    marginLeft: "auto",
    color: theme.colors.textMuted,
    fontSize: 11,
  },
});

export default styles;
