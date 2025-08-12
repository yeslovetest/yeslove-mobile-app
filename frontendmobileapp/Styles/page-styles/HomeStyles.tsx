import { StyleSheet } from "react-native";
import theme from "../Variables"
import { vw } from "@/ts/viewport-units";

const styles = StyleSheet.create({

    /* Header */

    container: {
        flex: 1,
        marginTop: 10,
        width: theme.spacing.standardPageContentWidth
    },


    /*User post box*/

    /* decor Box */

    decorBox: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 50,
        width: "100%",
        top: 0, 
        borderBottomWidth: 3,
        borderBottomColor: theme.colors.primaryBlue,
        opacity: 0.7,
    },

    userPostBoxContainer: {
        marginTop: vw(5),
        width: theme.spacing.postWidth,
        borderRadius: 10,
        height: 265,
        backgroundColor: "#fff",
        justifyContent: "flex-start",
        alignItems: "center",
    },

    userPostBox: {
        padding: 10,
        width: "100%",
        height: 100,
        paddingHorizontal: 10,
        marginBottom: vw(5)
    },

    postInput: {
      minHeight: 90,
      maxHeight: 150,
      outlineColor: "#fff",
      padding: 7
    },

    /*User post box button*/

    postButton: {
       width: 80,
       height: 30,
       backgroundColor: theme.colors.primaryBlue,
       display: "flex",
       justifyContent: "center",
       alignItems: "center",
       paddingVertical: 20,
       borderRadius: 5,
       opacity: 0.95
    },

    postButtonText: {
      color: "#fff"
    },

    /* post icons / */

    postIcons: {
        width: "80%",
        display: "flex",
        justifyContent: "space-around",
        flexDirection: "row",
        alignItems: "center",
        opacity: 0.8,
        marginBottom: 15
    },

    /* Home navbar styles*/
    
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
    
      /* */

  postContainer: {
    marginBottom: vw(5),
    width: theme.spacing.postWidth,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 20,
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
      flex: 1, 
      marginTop: 15
    },
    
    likeIcon: {
      marginRight: 20,
    },

    commentIcon: {
      marginLeft: 25,
      marginRight: 5,
    },

    /* comment section */

    commentContainer: {
      width: "100%",
     
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
      alignItems: "center",
      paddingVertical: 10
    },

    postCommentContainer: {
      width: "100%",
      
      display: "flex",
      justifyContent: "center",
      flexDirection: "row",
      alignItems: "center",
    },

    commentBox: {
      width: "70%",
      height: 35,
      borderWidth: 2,
      borderColor: "#ccc",
      outlineColor: "#ccc",
      borderRadius: 5,
      paddingHorizontal: 3,
    },

    commentProfileImage: {
      width: 45,
      height: 45,
      borderRadius: 60, 
      borderWidth: 1,
      borderColor: "#ccc",
      marginRight: 10,
    },

    submitCommentButton: {
      width: 80,
      height: 35,
      backgroundColor: theme.colors.primaryBlue,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 5,
      opacity: 0.95,
      marginLeft: 10,
    },

    submitCommentButtonText: {
            color: "#fff"
    },
  
   /* post reaction styles */  
   reactionPopUp :{
    visibility: 'hidden', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 0, 
    borderRadius: 10, 
    padding: 5,
    position: 'absolute', 
    left: 20, 
    bottom: 10, 
    backgroundColor: 'white', 
    zIndex: 1000, 
    shadowOffset: {width: 3, height: -2}, 
    shadowOpacity: 0.1, 
    elevation: 2 
  },

  reactionIcon: {
    borderRadius: 20, 
    padding: 5,
    backgroundColor: 'white', 
    zIndex: 100, 
    shadowOffset: {width: 3, height: -2}, 
    shadowOpacity: 0.2, 
    elevation: 3, 
    borderWidth: 1,
    borderColor: 'grey',
  },

  emoji: {
    fontSize: 24,
  }

})

export default styles