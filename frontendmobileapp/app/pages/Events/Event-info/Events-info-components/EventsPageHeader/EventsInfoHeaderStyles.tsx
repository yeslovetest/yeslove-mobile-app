import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  indEventContainer: {
    width: "94%",
    aspectRatio: 4 / 3,
    maxHeight: 330,
    minHeight: 260,
    alignSelf: "center",
    borderRadius: theme.radii.xxl,
    overflow: "hidden",
    marginBottom: 22,
    backgroundColor: theme.colors.surfaceAlt,
  },
  indEventImg: {
    width: "100%",
    height: "100%",
  },
  indEventImageStyle: {
    borderRadius: theme.radii.xxl,
  },
  overlayInd: {
    ...StyleSheet.absoluteFillObject,
    // Image legibility scrim (kept as a literal — not a themed surface color).
    backgroundColor: "rgba(0, 0, 0, 0.36)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 18,
    paddingTop: 72,
  },
  eventMetaContainer: {
    marginBottom: 10,
  },
  eventDateChip: {
    color: theme.colors.textOnPrimary,
    // Translucent brand chip over imagery — no solid token equivalent.
    backgroundColor: "rgba(45, 91, 227, 0.9)",
    fontSize: theme.typography.fontSize.caption,
    fontWeight: "600",
    overflow: "hidden",
    borderRadius: 12,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: 10,
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  eventNameInd: {
    fontSize: 26,
    color: theme.colors.textOnPrimary,
    fontWeight: "700",
    lineHeight: 31,
  },
  eventLocationInd: {
    marginTop: 6,
    fontSize: theme.typography.fontSize.callout,
    color: theme.colors.textOnPrimary,
    fontWeight: "500",
    opacity: 0.95,
  },
  favouriteContainer: {
    position: "absolute",
    borderRadius: theme.radii.xl,
    paddingVertical: 0,
    paddingHorizontal: 0,
    top: 12,
    right: 12,
    zIndex: 1,
    // Translucent white pill over imagery — kept as a literal.
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    overflow: "hidden",
  },
  favouritePressable: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  addToEventText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.footnote,
    fontWeight: "700",
  },
  attendingText: {
    color: theme.colors.textPrimary,
  },
});

export default styles;
