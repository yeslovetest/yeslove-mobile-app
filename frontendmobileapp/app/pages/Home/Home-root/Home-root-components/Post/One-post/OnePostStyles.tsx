import { StyleSheet, Dimensions } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  postContainer: {
    marginBottom: theme.spacing.xl,
    width: theme.layout.postWidth,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 10,
    borderRadius: 15,
    ...theme.shadows.md,
  },
  postHeaderContent: {
    width: "100%",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  indPostContainer: {
    borderBottomStartRadius: 0,
    borderBottomEndRadius: 0,
  },
  indCommentContainer: {
    marginTop: 0,
    marginBottom: 1,
    borderRadius: 0,
  },
  profileName: {
    marginBottom: 7,
  },
  profileNameText: {
    fontWeight: "600",
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.subhead,
  },
  postContent: {
    color: theme.colors.textPrimary,
    paddingHorizontal: 3,
    marginTop: 6,
    paddingBottom: theme.spacing.sm,
    width: "100%",
    fontSize: theme.typography.fontSize.subhead,
    lineHeight: 20,
  },
  postMediaWrapper: {
    width: "100%",
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
  },
  postImage: {
    width: Dimensions.get("window").width * 0.3,
    borderRadius: theme.radii.lg,
    marginTop: 10,
    marginBottom: theme.spacing.xl,
    resizeMode: "contain",
    aspectRatio: 1.5,
  },
  postVideo: {
    width: "100%",
    height: Dimensions.get("window").height * 0.5,
    borderRadius: theme.radii.lg,
    marginTop: 10,
    marginBottom: theme.spacing.xl,
    resizeMode: "cover",
  },
  profileImageContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
  },
  profileInfoContainer: {
    display: "flex",
    marginStart: 10,
    justifyContent: "center",
    alignItems: "flex-start",
    alignSelf: "flex-start",
    flexDirection: "column",
  },
  timePosted: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  seeLessAndLikeContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderTopColor: theme.colors.borderStrong,
    borderTopWidth: 1,
  },
  likeButtonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "auto",
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  likeIcon: {
    color: theme.colors.textPrimary,
  },
  reactionIcon: {
    marginRight: theme.spacing.sm,
  },
  numberOfLikesAndComments: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.footnote,
    fontWeight: "500",
    marginLeft: 5,
  },
  likeAndCommentContainer: {
    flexDirection: "row",
    height: "100%",
    width: "auto",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingRight: 6,
  },
  emoji: {
    fontSize: theme.typography.fontSize.title1,
  },

  /* follow user styles */

  followUserText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.footnote,
    textAlign: "center",
    fontWeight: "500",
    borderColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: theme.radii.sm,
  },
  followUser: {
    justifyContent: "center",
    alignItems: "flex-end",
    maxWidth: "42%",
  },
  followMenuPopUp: {
    flexDirection: "column",
    alignItems: "center",
    left: -4,
    bottom: 10,
    zIndex: 1000,
    shadowOffset: { width: 3, height: -2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  followMenuPopUpText: {
    color: theme.colors.textPrimary,
    textAlign: "left",
    fontSize: theme.typography.fontSize.subhead,
    fontWeight: "500",
    width: "100%",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: 14,
  },
  followMenuOptions: {
    width: "100%",
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
  },

  /* following user styles */
  viewProfile: {
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radii.sm,
    flexDirection: "row",
  },
  buttonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.footnote,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  reactionModalCard: {
    width: "92%",
    maxWidth: 380,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 14,
    textAlign: "center",
  },
  reactionModalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  reactionAction: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceAlt,
  },
  reactionActionLabel: {
    marginTop: 6,
    fontSize: theme.typography.fontSize.caption,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  followMenuCard: {
    width: "86%",
    maxWidth: 360,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },

  /* post options (three-dots) menu styles */
  postOptionsButton: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingLeft: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  postMenuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: 16,
  },
  postMenuDeleteText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.subhead,
    fontWeight: "600",
    marginLeft: 12,
  },
});

export default styles;
