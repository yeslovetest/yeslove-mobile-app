import { StyleSheet, Dimensions } from "react-native";

import { theme } from "@/app/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

const styles = StyleSheet.create({
  previewContainer: {
    position: "relative",
    marginRight: theme.spacing.sm,
  },
  previewImage: {
    borderRadius: 12,
  },
  previewVideo: {
    borderRadius: 12,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radii.lg,
  },
  overlayText: {
    color: theme.colors.textOnPrimary,
    fontWeight: "bold",
    fontSize: theme.typography.fontSize.title3,
  },
  text: {
    textAlign: "center",
    marginTop: theme.spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.title3,
    fontWeight: "bold",
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  closeButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.textPrimary,
    paddingVertical: 10,
    borderRadius: theme.radii.md,
  },
  closeText: {
    color: theme.colors.textOnPrimary,
    textAlign: "center",
  },
  deleteWrapper: {
    position: "absolute",
    top: 10,
    right: 10,
    // Translucent delete badge over media — kept as a literal.
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 28,
    height: 28,
    borderRadius: theme.radii.xl,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  deleteIcon: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.callout,
    fontWeight: "bold",
    lineHeight: 16,
  },
  fileName: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textMuted,
    width: SCREEN_WIDTH * 0.3,
    textAlign: "center",
  },
  arrowWrapper: {
    position: "absolute",
    top: "45%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.xxl,
    // Translucent nav control over media — kept as a literal.
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonDisabled: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  navButtonText: {
    fontSize: theme.typography.fontSize.title3,
    color: theme.colors.textOnPrimary,
    fontWeight: "700",
  },
  pageIndicator: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    // Translucent indicator over media — kept as a literal.
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: theme.spacing.xs,
  },
  pageIndicatorText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.caption,
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: theme.spacing.xxs,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    // Translucent inactive dot over media — kept as a literal.
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  dotActive: {
    width: 16,
    backgroundColor: theme.colors.primary,
  },
});

export default styles;
