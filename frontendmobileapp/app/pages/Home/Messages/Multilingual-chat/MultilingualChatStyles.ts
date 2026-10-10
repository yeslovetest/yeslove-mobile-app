import { StyleSheet } from "react-native";
import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.callout,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSubtitle: {
    color: theme.colors.textOnPrimary,
    fontSize: 11,
    textAlign: "center",
    opacity: 0.85,
  },

  /* persona picker */
  pickerContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  pickerTitle: {
    fontSize: theme.typography.fontSize.title2,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  pickerSubtitle: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.footnote,
    color: theme.colors.textMuted,
  },
  pickerList: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  personaCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  personaAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  personaAvatarText: {
    color: theme.colors.textOnPrimary,
    fontWeight: "700",
    fontSize: theme.typography.fontSize.callout,
  },
  personaTextBlock: {
    flex: 1,
  },
  personaName: {
    fontSize: theme.typography.fontSize.callout,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  personaLanguage: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },

  /* chat */
  messagesContainer: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  userBubbleRow: {
    alignItems: "flex-end",
    marginBottom: theme.spacing.sm,
  },
  userBubble: {
    maxWidth: "86%",
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    borderBottomRightRadius: 8,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 14,
  },
  userBubbleText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.callout,
  },
  botBubbleRow: {
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  botBubble: {
    maxWidth: "86%",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 14,
  },
  botBubbleText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.callout,
  },
  errorText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.danger,
    fontSize: 13,
    textAlign: "center",
  },

  /* input dock */
  inputDock: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 96,
    borderRadius: theme.radii.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.body,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
