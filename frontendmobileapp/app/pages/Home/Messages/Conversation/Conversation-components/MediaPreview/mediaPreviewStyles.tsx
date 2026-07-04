import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  previewContainer: {
    position: "relative",
    alignSelf: "center",
    marginBottom: 6,
  },
  previewImage: {
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surfaceAlt,
  },
  previewVideo: {
    borderRadius: theme.radii.xl,
    // Dark video backdrop — kept as a literal.
    backgroundColor: "#0f172a",
  },
  moreChip: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.pill,
  },
  moreChipSent: {
    // Translucent chip over the sent (blue) bubble — kept as literals.
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.35)",
  },
  moreChipReceived: {
    backgroundColor: theme.colors.primarySoft,
    // Light-blue received-bubble chip border — kept as a literal.
    borderColor: "#c9dcff",
  },
  moreChipText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  moreChipTextSent: {
    color: theme.colors.textOnPrimary,
  },
  moreChipTextReceived: {
    // Navy text on the light received-bubble chip — kept as a literal.
    color: "#1f3b75",
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
    ...theme.shadows.sm,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.title3,
    fontWeight: "bold",
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  closeButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: theme.radii.md,
  },
  closeText: {
    color: theme.colors.textOnPrimary,
    textAlign: "center",
  },
  deleteWrapper: {
    position: "absolute",
    top: 4,
    right: 4,
    // Translucent delete badge over media — kept as a literal.
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  deleteIcon: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.subhead,
    fontWeight: "bold",
    lineHeight: 14,
  },
  fullScreenContainer: {
    flex: 1,
    // Full-screen media lightbox background — kept as a literal.
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
  },
  fullScreenClose: {
    position: "absolute",
    top: 48,
    right: 18,
    zIndex: 20,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.xxl,
  },
  fullScreenCloseText: {
    color: theme.colors.textOnPrimary,
    fontWeight: "700",
    fontSize: theme.typography.fontSize.footnote,
  },
  fullScreenItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
  },
  fullScreenVideo: {
    width: "100%",
    height: "80%",
  },
  fullScreenFooter: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.xl,
  },
  fullScreenCounter: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.caption,
    fontWeight: "600",
  },
});

export default styles;
