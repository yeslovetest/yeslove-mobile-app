import theme from "@/assets/variables/Variables";
import { vw } from "@/ts/viewport-units";
import { StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const bodyFontSize = Math.min(Math.max(SCREEN_WIDTH * 0.040, 15), 18);
const metaFontSize = Math.min(Math.max(SCREEN_WIDTH * 0.031, 12), 14);
const titleFontSize = Math.min(Math.max(SCREEN_WIDTH * 0.043, 16), 20);

const styles = StyleSheet.create({
    keyboardContainer: {
      flex: 1,
      width: '100%',
    },

    commentComposerWrap: {
      width: '100%',
      backgroundColor: '#fff',
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
      color: "#6f6f6f",
      fontSize: metaFontSize,
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
      profileImageContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row"
  },
    profileImage: {
      width: 50,
      height: 50,
    borderRadius: 60, 
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  postImage: { 
    width: '100%',
    maxWidth: SCREEN_WIDTH - 48,
    borderRadius: 10, 
    marginTop: 8,
    marginBottom: 8,
    resizeMode: 'contain',
    aspectRatio: 1.3,
  },
  postVideo: { 
    width: '100%', 
    minHeight: 220,
    maxHeight: Math.min(SCREEN_HEIGHT * 0.5, 340),
    borderRadius: 10, 
    marginTop: 8,
    marginBottom: 8,
    resizeMode: 'cover' 
  },
    profileName: {
    marginBottom: 4,
    fontWeight: "600",
    fontSize: titleFontSize,
  },
    postContent: {
    color: "#3f3f3f",
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
    flexDirection: "column"
  },
      postContainer: {
    marginBottom: vw(5),
    width: '100%',
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  postMediaWrapper: {
    width: '100%',
    marginTop: 4,
    marginBottom: 4,
  },
    
    likeButtonContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1, 
      marginTop: 8
    },
    likeIcon: {
      color: theme.colors.blackText,
    },
    reactionIcon: {
      marginRight: 8,
    },
        homeNavBarContainer: {
      flex: 0,
      justifyContent: "flex-start",
      alignItems: "stretch",
      width: "100%",
      marginTop: 2,
      marginBottom: 10,
    },

        homeNavBar: {
      flexDirection: "row",
      flexWrap: "wrap", 
      width: '100%',
      justifyContent: "center",
      backgroundColor: "#fff",
      paddingVertical: 3,
      borderRadius: 10, 
      elevation: 3, 
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
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
      paddingVertical: 12,
      alignItems: "center",
    },
    activeHomeItem: {
      position: "relative",
    },
    activeHomeNavText: {
      fontWeight: "bold",
      color: "#111",
      fontSize: bodyFontSize,
    },
    navText: {
        fontSize: bodyFontSize,
        color: theme.colors.iconNotActive,
        fontWeight: "500",
      },
      activeIndicator: {
        width: 40,
        height: 3,
        backgroundColor: theme.colors.primaryBlue, 
        position: "absolute",
        bottom: -2, 
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
      fontSize: titleFontSize,
      fontWeight: '700',
      color: '#111',
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
      fontSize: metaFontSize,
      fontWeight: '600',
      color: '#111',
    },
})

export default styles