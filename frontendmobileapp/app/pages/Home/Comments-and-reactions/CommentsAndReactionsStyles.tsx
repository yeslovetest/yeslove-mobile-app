import { StyleSheet, Dimensions } from "react-native";

import { theme } from "@/app/theme";
import { vw } from "@/ts/viewport-units";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const bodyFontSize = Math.min(Math.max(SCREEN_WIDTH * 0.04, 15), 18);
const metaFontSize = Math.min(Math.max(SCREEN_WIDTH * 0.031, 12), 14);
const titleFontSize = Math.min(Math.max(SCREEN_WIDTH * 0.043, 16), 20);

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    width: "100%",
  },
  commentComposerWrap: {
    width: "100%",
    backgroundColor: theme.colors.surface,
  },
  contentContainer: {
    width: "100%",
    alignItems: "stretch",
    paddingBottom: 100,
    paddingHorizontal: 0,
  },
  indPostContainer: {
    borderBottomStartRadius: 0,
    borderBottomEndRadius: 0,
  },
  timePosted: {
    color: theme.colors.textMuted,
    fontSize: metaFontSize,
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
  profileImageContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    maxWidth: SCREEN_WIDTH - 48,
    borderRadius: theme.radii.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    resizeMode: "contain",
    aspectRatio: 1.3,
  },
  postVideo: {
    width: "100%",
    minHeight: 220,
    maxHeight: Math.min(SCREEN_HEIGHT * 0.5, 340),
    borderRadius: theme.radii.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    resizeMode: "cover",
  },
  profileName: {
    marginBottom: theme.spacing.xs,
    fontWeight: "600",
    fontSize: titleFontSize,
  },
  postContent: {
    color: theme.colors.textSecondary,
    paddingHorizontal: 3,
    paddingTop: 6,
    paddingBottom: 10,
    width: "100%",
    fontSize: bodyFontSize,
    lineHeight: Math.round(bodyFontSize * 1.5),
  },
  profileInfoContainer: {
    display: "flex",
    marginStart: 10,
    justifyContent: "center",
    alignItems: "flex-start",
    alignSelf: "flex-start",
    flexDirection: "column",
  },
  postContainer: {
    marginBottom: vw(5),
    width: "100%",
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: 14,
    borderRadius: 12,
    ...theme.shadows.sm,
  },
  postMediaWrapper: {
    width: "100%",
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  likeButtonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    marginTop: theme.spacing.sm,
  },
  likeIcon: {
    color: theme.colors.textPrimary,
  },
  reactionIcon: {
    marginRight: theme.spacing.sm,
  },
  homeNavBarContainer: {
    flex: 0,
    justifyContent: "flex-start",
    alignItems: "stretch",
    width: "100%",
    marginTop: theme.spacing.xxs,
    marginBottom: 10,
  },
  homeNavBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    paddingVertical: 3,
    borderRadius: theme.radii.lg,
    ...theme.shadows.md,
  },
  indPostNavBarContainer: {
    marginTop: 1,
    marginBottom: 1,
    borderRadius: 0,
  },
  indPostNavBar: {
    borderRadius: 0,
  },
  homeItem: {
    width: "50%",
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
  activeHomeItem: {
    position: "relative",
  },
  activeHomeNavText: {
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontSize: bodyFontSize,
  },
  navText: {
    fontSize: bodyFontSize,
    color: theme.colors.textMuted,
    fontWeight: "500",
  },
  activeIndicator: {
    width: 40,
    height: 3,
    backgroundColor: theme.colors.primary,
    position: "absolute",
    bottom: -2,
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
    fontSize: titleFontSize,
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
    fontSize: metaFontSize,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
});

export default styles;
