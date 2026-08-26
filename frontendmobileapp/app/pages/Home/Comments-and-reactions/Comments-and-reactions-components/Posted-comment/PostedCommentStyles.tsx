import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";
import { vw } from "@/ts/viewport-units";

const styles = StyleSheet.create({
  postContainer: {
    marginBottom: vw(5),
    width: theme.layout.postWidth,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "flex-start",
    padding: theme.spacing.xl,
    borderRadius: 15,
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
    fontWeight: "600",
    fontSize: theme.typography.fontSize.callout,
  },
  postContent: {
    color: theme.colors.textSecondary,
    paddingHorizontal: 3,
    paddingBottom: 10,
    width: "100%",
    fontSize: theme.typography.fontSize.body,
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
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
    justifyContent: "space-between",
    flex: 1,
    marginTop: 15,
  },
  reactionPopUp: {
    visibility: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 0,
    width: 110,
    borderRadius: theme.radii.lg,
    padding: 5,
    position: "absolute",
    bottom: 30,
    backgroundColor: theme.colors.surface,
    zIndex: 1000,
    shadowOffset: { width: 3, height: -2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  emoji: {
    fontSize: theme.typography.fontSize.title1,
  },
});

export default styles;
