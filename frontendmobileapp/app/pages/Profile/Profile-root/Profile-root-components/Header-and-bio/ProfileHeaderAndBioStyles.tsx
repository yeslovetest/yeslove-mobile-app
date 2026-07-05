import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.fontSize.title1,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
  profileImageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  profileBackgroundImage: {
    width: theme.layout.postWidth,
    minHeight: 250,
    display: "flex",
    justifyContent: "space-between",
    gap: theme.spacing.lg,
    alignItems: "center",
    borderRadius: theme.radii.xxl,
    overflow: "hidden",
    paddingVertical: 18,
    paddingHorizontal: 14,
    ...theme.shadows.lg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // Dark image scrim for hero legibility — kept as a literal.
    backgroundColor: "rgba(7, 18, 45, 0.45)",
    borderRadius: theme.radii.xxl,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: theme.colors.surface,
  },
  profileImageWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.xs,
  },
  changePhotoBadge: {
    position: "absolute",
    bottom: -12,
    alignSelf: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.xl,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  changePhotoBadgeText: {
    color: theme.colors.textOnPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  previewActionsContainer: {
    width: "88%",
    marginTop: theme.spacing.xs,
    alignItems: "center",
  },
  previewMessage: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.caption,
    marginBottom: 7,
    textAlign: "center",
  },
  previewButtonsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  previewButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    paddingVertical: theme.spacing.sm,
  },
  previewButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.footnote,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.primary,
  },
  uploadButton: {
    backgroundColor: theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  validationMessage: {
    marginTop: theme.spacing.xs,
    // Light error text over the dark hero image — kept as a literal.
    color: "#ffb4b4",
    fontSize: theme.typography.fontSize.caption,
    fontWeight: "600",
    textAlign: "center",
    width: "90%",
  },
  successMessage: {
    marginTop: theme.spacing.xs,
    // Light success text over the dark hero image — kept as a literal.
    color: "#d0ffd7",
    fontSize: theme.typography.fontSize.caption,
    fontWeight: "600",
    textAlign: "center",
    width: "90%",
  },
  userName: {
    color: theme.colors.textOnPrimary,
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  userStatsContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xxs,
  },
  userStats: {
    // Light-gray stat text over the dark hero image — kept as a literal.
    color: "#e5e7eb",
    fontSize: theme.typography.fontSize.caption,
    marginLeft: 0,
    marginRight: 0,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: theme.radii.pill,
    // Translucent white chip over imagery — kept as a literal.
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    overflow: "hidden",
  },
  userStatsNumber: {
    fontWeight: "700",
    color: theme.colors.textOnPrimary,
  },
  userBioContainer: {
    width: "100%",
    minHeight: 78,
    marginTop: theme.spacing.md,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userBioText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.footnote,
    lineHeight: 19,
  },
  emptyBioTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.subhead,
    fontWeight: "700",
    marginBottom: 3,
  },
  emptyBioText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.caption,
    lineHeight: 17,
  },
});

export default styles;
