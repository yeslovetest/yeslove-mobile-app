import { StyleSheet } from "react-native";
import theme from "../Variables"

const styles = StyleSheet.create({

    /* Header */

    container: {
        flex: 1,
        marginTop: 10,
        width: theme.spacing.standardPageContentWidth
    },

    contentContainer: {
        justifyContent: "flex-start",
        alignItems: "center",
      },

    feedHeaderContainer: {
        width: theme.spacing.postWidth,
        height: 115,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.bannerOrange,
    },

    contentRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
    },
    textContainer: {
        justifyContent: "center",
        alignItems: "flex-start",
        borderLeftWidth: 5,
        borderLeftColor: "#fff",
        paddingHorizontal: 10
    },

    imageBackground: {
        position: "absolute",  
        top: 0,
        left: 0,
        right: 0,
        bottom: 0, 
        width: "100%",  
        height: "100%", 
    },

    feedHeaderText: {
        fontSize: 23,
        color: "#fff",
        fontWeight: "bold",
    },

    feedHeaderCaption: {
        fontSize: 15,
        color: "#fff",
        fontWeight: "600",
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
        marginTop: 30,
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
        marginBottom: 15
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
      marginTop: 20,
      marginBottom: 20
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
    marginTop: 20,
    width: theme.spacing.postWidth,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },

  profileName: {
    marginBottom: 7,
    fontWeight: "600",
    fontSize: 16,
  },

  postContent: {
    color: "#555",
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
    },
    
    likeButtonContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      flex: 1, 
      marginTop: 15
    },
    
    likeIcon: {
      marginRight: 5,
    },

    commentIcon: {
      marginLeft: 15,
      marginRight: 5,
    },

    /* comment section */

    commentContainer: {
      width: "100%",
      height: 90,
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
      alignItems: "center",
      paddingVertical: 10
    },

    postCommentContainer: {
      width: "100%",
      height: 100,
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
    }
    

})

export default styles