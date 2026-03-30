import theme from "@/assets/variables/Variables";
import { vw } from "@/ts/viewport-units";
import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
  postContainer: {
    marginBottom: vw(5),
    width: theme.spacing.postWidth,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 10,
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
  },

  profileNameText: {
    fontWeight: "600",
    color: theme.colors.blackText,
    fontSize: 16,
  },

  postContent: {
    color: theme.colors.blackText,
    paddingHorizontal: 3,
    marginTop: 10,
    paddingBottom: 10,
    width: "100%",
    fontSize: 16,
    lineHeight: 24,
  },

  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },

  postImage: { 
    width: Dimensions.get('window').width * 0.3, 
    borderRadius: 10, 
    marginTop: 10,
    marginBottom: 20,
    resizeMode: 'contain',
    aspectRatio: 1.5,
  },

  postVideo: { 
    width: '100%', 
    height: Dimensions.get('window').height * 0.5,
    borderRadius: 10, 
    marginTop: 10,
    marginBottom: 20,
    resizeMode: 'cover'
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
    color: "#888",
    fontSize: 12,
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
    justifyContent: "flex-start",
    width: "auto",
    gap: 16,
    marginTop: 15,
  },
  likeIcon: {
    color: theme.colors.blackText
  },

  reactionIcon: {
    marginRight: 8,
  },
  numberOfLikesAndComments: {
    color: theme.colors.blackText,
    fontSize: 15,
    fontWeight: '500',
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
    fontSize: 24,
  },

  /* follow user styles */

  followUserText: {
    color: theme.colors.primaryBlue,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    borderColor: theme.colors.primaryBlue,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 5,
  },

  followUser: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    maxWidth: '42%',
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
    fontSize: 15,
    fontWeight: '500',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  followMenuOptions: {
    width: '100%',
    borderBottomColor: '#EBEDF1',
    borderBottomWidth: 1,

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
    fontSize: 14,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  reactionModalCard: {
    width: '92%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 14,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.blackText,
    marginBottom: 14,
    textAlign: 'center',
  },

  reactionModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  reactionAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F7F8FA',
  },

  reactionActionLabel: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.blackText,
  },

  followMenuCard: {
    width: '86%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },


})

export default styles