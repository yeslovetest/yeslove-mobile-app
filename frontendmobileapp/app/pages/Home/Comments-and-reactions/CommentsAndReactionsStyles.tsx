import theme from "@/assets/variables/Variables";
import { vw } from "@/ts/viewport-units";
import { StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
    contentContainer: {
      width: "100%",
      alignItems: "center",
      paddingBottom: 88,
    },
        indPostContainer: {
    borderBottomStartRadius: 0,
    borderBottomEndRadius: 0,
  },
        timePosted: {
      color: "#6f6f6f",
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
    maxWidth: SCREEN_WIDTH - 60,
    borderRadius: 10, 
    marginTop: 10,
    resizeMode: 'contain',
    aspectRatio: 1.3,
  },
  postVideo: { 
    width: '100%', 
    minHeight: 220,
    maxHeight: Math.min(SCREEN_HEIGHT * 0.5, 340),
    borderRadius: 10, 
    marginTop: 10,
    marginBottom: 14,
    resizeMode: 'cover' 
  },
    profileName: {
    marginBottom: 4,
    fontWeight: "600",
    fontSize: 15,
  },
    postContent: {
    color: "#3f3f3f",
    paddingHorizontal: 3,
    paddingBottom: 10,
    width: "100%",
    fontSize: 15,
    lineHeight: 22,
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
    maxWidth: 760,
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
       reactionPopUp :{
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
    shadowOffset: {width: 3, height: -2}, 
    shadowOpacity: 0.1, 
    elevation: 2 
  },
    
    likeButtonContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1, 
      marginTop: 8
    },
        homeNavBarContainer: {
      flex: 0,
      justifyContent: "flex-start",
      alignItems: "center",
      width: "100%",
      marginTop: 2,
      marginBottom: 10,
    },

        homeNavBar: {
      flexDirection: "row",
      flexWrap: "wrap", 
      width: '100%',
      maxWidth: SCREEN_WIDTH - 20,
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
      fontSize: 15,
    },
    navText: {
        fontSize: 15,
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
})

export default styles