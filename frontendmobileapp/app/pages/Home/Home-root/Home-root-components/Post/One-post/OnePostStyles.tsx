import theme from "@/assets/variables/Variables";
import { vw } from "@/ts/viewport-units";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  postContainer: {
    marginBottom: vw(5),
    width: theme.spacing.postWidth,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  postHeaderContent: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row'
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
    fontSize: 16,
  },

  postContent: {
    color: "#555",
    paddingHorizontal: 3,
    paddingBottom: 10,
    width: "100%",
    fontSize: 15,
  },

  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },

  profileImageContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row"
  },

  profileInfoContainer: {
    display: "flex",
    marginStart: 10,
    justifyContent: "center",
    alignItems: "flex-start",
    alignSelf: "flex-start",
    flexDirection: "column"
  },

  timePosted: {
    color: "#888"
  },

  seeLessAndLikeContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderTopColor: theme.colors.footerBdColor,
    borderTopWidth: 1,

  },

  likeButtonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "45%",
    marginTop: 15,
  },
  reactionPopUp: {
    visibility: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0,
    width: 110,
    borderRadius: 10,
    padding: 5,
    position: 'absolute',
    bottom: 30,
    backgroundColor: 'white',
    zIndex: 1000,
    shadowOffset: { width: 3, height: -2 },
    shadowOpacity: 0.1,
    elevation: 2
  },
  likeIcon: {
    color: theme.colors.blackText
  },
  numberOfLikesAndComments: {
    color: theme.colors.blackText
  },

  likeAndCommentContainer: {
    flexDirection: "row",
    height: "100%",
    width: "30%",
    justifyContent: "space-between",
    alignItems: "center"
  },

  emoji: {
    fontSize: 24,
  },

  /* follow user styles */

  followUserText: {
    color: theme.colors.primaryBlue,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '300',
    borderColor: theme.colors.primaryBlue,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 5,
  },

  followMenuPopUp: {
    flexDirection: 'column',
    alignItems: 'center',
    left: -4,
    bottom: 10,
    zIndex: 1000,
    shadowOffset: { width: 3, height: -2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  followMenuPopUpText: {
    color: theme.colors.blackText,
    textAlign: 'left',
    fontSize: 16,
    fontWeight: '400',
    width: '100%',
    padding: 12,
  },
  followMenuOptions: {
    width: '100%',

  },


  /* following user styles */
  viewProfile: {
    backgroundColor: "#7296ED",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 5,
    flexDirection: "row",

  },
  buttonText: {
    color: "#ffffff",
    fontSize: 13,
  },


})

export default styles