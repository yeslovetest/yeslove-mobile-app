import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 10,
  },
  gridContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  emptyStateContainer: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
  },
  emptyStateText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSize.subhead,
    fontWeight: "600",
  },
  viewerContainer: {
    flex: 1,
    // Full-screen media lightbox background — intentionally near-opaque dark.
    backgroundColor: "rgba(2, 6, 23, 0.97)",
    justifyContent: "center",
  },
  viewerClose: {
    position: "absolute",
    top: 52,
    right: 16,
    zIndex: 20,
    // Translucent control over media — kept as a literal.
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: theme.radii.xxl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 7,
  },
  viewerCloseText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.footnote,
    fontWeight: "700",
  },
  viewerItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewerImage: {
    width: "100%",
    height: "80%",
  },
  viewerVideo: {
    width: "100%",
    height: "80%",
  },
  viewerFooter: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    // Translucent control over media — kept as a literal.
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
  },
  viewerCount: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.caption,
    fontWeight: "600",
  },
});

export default styles;
