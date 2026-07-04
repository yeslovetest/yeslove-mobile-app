import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const messagesSharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 10,
  },
  contentContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingBottom: theme.spacing.xxl,
  },
  messagesText: {
    width: "100%",
    textAlign: "left",
    fontSize: theme.typography.fontSize.title1,
    fontWeight: "700",
    paddingVertical: 10,
    color: theme.colors.textPrimary,
  },
  filterBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButton: {
    minWidth: 60,
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 16,
    marginRight: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonInactive: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  filterButtonText: {
    fontSize: theme.typography.fontSize.subhead,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: theme.colors.textOnPrimary,
  },
  filterButtonTextInactive: {
    color: theme.colors.primary,
  },
});

export default messagesSharedStyles;
