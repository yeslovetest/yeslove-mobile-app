import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  eventInfo: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  addressContainer: {
    width: "94%",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addressHeader: {
    fontSize: theme.typography.fontSize.footnote,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    marginBottom: 7,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  eventAddress: {
    fontSize: theme.typography.fontSize.callout,
    fontWeight: "500",
    lineHeight: 24,
    color: theme.colors.textPrimary,
  },
  dateAndTimeContainer: {
    width: "94%",
    justifyContent: "space-between",
    flexDirection: "row",
    marginBottom: 18,
  },
  dateContainer2: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    width: "48.5%",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateHeader: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  eventDate: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  timeContainer: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    width: "48.5%",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timeHeader: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  eventTime: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  extraInfoContainer: {
    width: "94%",
    backgroundColor: theme.colors.surface,
    minHeight: 190,
    borderRadius: theme.radii.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: 15,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  extraInfoHeader: {
    fontSize: theme.typography.fontSize.footnote,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  eventExtraInfo: {
    fontSize: theme.typography.fontSize.callout,
    fontWeight: "500",
    lineHeight: 24,
    color: theme.colors.textPrimary,
  },
});

export default styles;
