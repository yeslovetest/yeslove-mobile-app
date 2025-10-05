import theme from "@/assets/variables/Variables";
import { vw } from "@/ts/viewport-units";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
        indPostContainer: {
    borderBottomStartRadius: 0,
    borderBottomEndRadius: 0,
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
      profileImageContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row"
  },
    profileImage: {
    width: 55,
    height: 55,
    borderRadius: 60, 
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
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
    width: theme.spacing.postWidth,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 20,
    borderRadius: 15,
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
      marginTop: 15
    },
        homeNavBarContainer: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      marginTop: vw(5),
          marginBottom: vw(5),
    },

        homeNavBar: {
      flexDirection: "row",
      flexWrap: "wrap", 
      width: theme.spacing.postWidth, 
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
      paddingVertical: 15,
      alignItems: "center",
    },
    activeHomeItem: {
      position: "relative",
    },
    activeHomeNavText: {
      fontWeight: "bold",
      color: "#000",
      fontSize: 16,
    },
    navText: {
        fontSize: 16,
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