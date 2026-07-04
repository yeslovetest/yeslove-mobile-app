import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  searchBarContainer: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 12,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "center",
    gap: theme.spacing.sm,
  },
  searchBar: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    minWidth: 0,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: theme.colors.textOnPrimary,
    fontWeight: "600",
  },
});

export default styles;
