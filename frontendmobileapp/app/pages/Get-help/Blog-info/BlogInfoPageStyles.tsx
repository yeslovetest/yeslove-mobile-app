import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingTop: theme.spacing.sm,
  },
  indBlogContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  contentContainer: {
    width: "100%",
    paddingBottom: 28,
  },
  progressContainer: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.sm,
  },
});

export default styles;
