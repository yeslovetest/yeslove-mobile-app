import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  /* header */

  headerContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    height: 60,
    borderBottomColor: theme.colors.surface,
    borderBottomWidth: 1,
  },
  headerText: {
    textAlign: "center",
    fontSize: theme.typography.fontSize.title1,
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
  onlineNowContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 15,
  },
  headerProfile: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  headerBotProfileImage: {
    color: theme.colors.textOnPrimary,
    marginBottom: theme.spacing.xxs,
    fontSize: theme.typography.fontSize.title2,
  },
  chatbot: {
    fontWeight: "500",
    fontSize: theme.typography.fontSize.callout,
    color: theme.colors.textOnPrimary,
  },
  onlineNow: {
    fontSize: 11,
    color: theme.colors.textOnPrimary,
  },
  onlineNowRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xxs,
  },
  onlineSymbol: {
    width: 7,
    height: 7,
    backgroundColor: theme.colors.success,
    borderRadius: 4,
    marginRight: 3,
  },
  dots: {
    color: theme.colors.textPrimary,
    marginLeft: "auto",
    padding: theme.spacing.sm,
  },

  /* containers */

  outerView: {
    flex: 1,
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
    backgroundColor: theme.colors.surfaceAlt,
  },
  contentContainer: {
    flexGrow: 1,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 14,
    paddingBottom: theme.spacing.xl,
  },
  backgroundContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    height: "100%",
  },
  background: {
    minHeight: "100%",
    width: "100%",
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: "100%",
  },
  chatBody: {
    flex: 1,
    width: "100%",
    backgroundColor: theme.colors.surfaceAlt,
  },

  /* greeting container */

  greetingContainer: {
    display: "flex",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  chatIcon: {
    color: theme.colors.textOnPrimary,
  },
  greetingRobot: {
    height: 300,
    width: 300,
  },

  /* text input */
  textInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 620,
    minHeight: 50,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 7,
    borderRadius: theme.radii.xxl,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 34,
    maxHeight: 96,
    fontSize: theme.typography.fontSize.body,
    lineHeight: 20,
    color: theme.colors.textPrimary,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  sendIcon: {
    padding: theme.spacing.sm,
    color: theme.colors.textOnPrimary,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  },
  chatInputDock: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    paddingTop: 10,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  /* chat prompt */

  chatPromptContainer: {
    width: "100%",
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    marginTop: "auto",
  },
  promptAndTimeSentContainer: {
    alignSelf: "flex-end",
    maxWidth: "86%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  chatPrompt: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    borderBottomRightRadius: 8,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: 14,
    flexShrink: 1,
  },
  promptText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.callout,
    fontFamily: "sans-serif",
    flexShrink: 1,
    flexWrap: "wrap",
    flex: 1,
    lineHeight: 22,
  },
  timeSentPrompt: {
    marginTop: 6,
    alignSelf: "flex-end",
    // Dimmed timestamp over the blue user bubble — kept as a literal.
    color: "#dbe7f3",
    fontSize: 11,
  },
  profileImg: {
    width: 34,
    height: 34,
    marginLeft: 6,
    marginBottom: theme.spacing.xxs,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },

  /* chat response */

  chatResponseContainer: {
    width: "100%",
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    alignItems: "flex-start",
  },
  chatResponse: {
    fontFamily: "sans-serif",
    width: "100%",
    maxWidth: "92%",
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: theme.typography.fontSize.callout,
    ...theme.shadows.sm,
  },
  timeSentResponseContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  timeSentResponse: {
    marginTop: 6,
    marginLeft: 6,
    color: theme.colors.textMuted,
    fontSize: 11,
  },

  /* bot profile picture */

  botProfile: {
    marginLeft: -10,
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 9,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
  },
  botProfileImage: {
    // Chatbot signature light-blue accent — kept as a literal.
    color: "#b8e0fc",
    marginBottom: theme.spacing.xxs,
  },
  botProfileImagee: {
    width: 60,
    height: 60,
  },

  /* loader */
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    justifyContent: "flex-start",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    width: "100%",
  },
  dot: {
    height: 8,
    width: 8,
    marginRight: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    // Chatbot signature light-blue accent — kept as a literal.
    backgroundColor: "#b8e0fc",
  },
});

export default styles;
