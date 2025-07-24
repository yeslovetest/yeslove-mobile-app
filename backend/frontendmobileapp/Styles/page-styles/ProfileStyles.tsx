
import { StyleSheet } from 'react-native';
import theme from "../Variables"


const styles = StyleSheet.create({

/*Profile header styles*/

  container: {
    flex: 1,
    marginTop: 10,
    width: theme.spacing.standardPageContentWidth
  },
  contentContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  profileImageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  profileBackgroundImage: {
    width: theme.spacing.postWidth,
    height: 340,
    display: "flex",
    justifyContent: "center",
    gap: 30,
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 15
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    borderWidth: 5,
    borderStyle: "solid",
    borderColor: "#fff"
  },
  userName: {
   color: "#fff",
   fontSize: 20,
   fontWeight: 600
  },
  userStatsContainer: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
  },
  userStats: {
    color: "#c5c5c5",
    fontSize: 20,
    marginLeft: 10,
    marginRight: 10
  },
  userStatsNumber: {
    fontWeight: 600,
    color: "#fff"
  },

/* User bio styles*/

userBioContainer:{
  width: "100%",
  height: 80,
  marginTop: 20,
  borderRadius: 10,
  backgroundColor: "#fff",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  padding: 13,
},
userBioText: {
  color: "#000"
},



/*Navbar styles*/

navBarContainer: {
  flex: 1,
  justifyContent: "flex-start",
  alignItems: "center",
  marginTop: 20,
},
navBar: {
  flexDirection: "row",
  flexWrap: "wrap", 
  width: theme.spacing.postWidth, 
  justifyContent: "center",
  backgroundColor: "#fff",
  paddingVertical: 10,
  borderRadius: 10, 
  elevation: 3, 
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
navItem: {
  width: "50%",
  paddingVertical: 15,
  alignItems: "center",
},
navText: {
  fontSize: 16,
  color: theme.colors.iconNotActive,
  fontWeight: "500",
},
activeNavItem: {
  position: "relative",
},
activeNavText: {
  fontWeight: "bold",
  color: "#000",
},
activeIndicator: {
  width: 40,
  height: 3,
  backgroundColor: theme.colors.primaryBlue, 
  position: "absolute",
  bottom: -2, 
},
content: {
  marginTop: 20,
  alignItems: "center",
},
pageText: {
  fontSize: 20,
},

/* Friends section styles */

friendsContainer: {
  flex: 1,
  justifyContent: "flex-start",
  alignItems: "center",
  marginTop: 10,
},
friends: {
  flexDirection: "column",
  flexWrap: "wrap", 
  width: theme.spacing.postWidth - 50, 
  justifyContent: "flex-start",
  backgroundColor: "#fff",
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 10, 
  elevation: 3, 
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
friendsItem: {
  width: "50%",
  paddingHorizontal: 5,
  paddingVertical: 15,
  alignItems: "flex-start",
  marginBottom: 15,
},
activeFriendsText: {
  fontWeight: "bold",
  color: "#000",
  fontSize: 19
},

friendsText: {
  fontWeight: "bold",
  color: "#000",
},

/* Friends list*/

friend: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#ddd",
},

friendImage: {
  width: 50,
  height: 50,
  borderRadius: 25, 
  marginRight: 10,
},

friendName: {
  fontSize: 16,
  fontWeight: "500",
  color: "#000",
},




/* About navbar styles*/

aboutNavBarContainer: {
  flex: 1,
  justifyContent: "flex-start",
  alignItems: "center",
  marginTop: 10,
  marginBottom: 20
},
aboutNavBar: {
  flexDirection: "row",
  flexWrap: "wrap", 
  width: theme.spacing.postWidth - 50, 
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
aboutItem: {
  width: "50%",
  paddingVertical: 15,
  alignItems: "center",
},
activeAboutItem: {
  position: "relative",
},
activeAboutNavText: {
  fontWeight: "bold",
  color: "#000",
},

/*About/view*/

viewItemContainer: {
  backgroundColor: "#fff",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  paddingHorizontal: 30,
  paddingVertical: 15,
  marginBottom: 20,
  width: theme.spacing.postWidth,
},

viewItemText: {
  fontSize: 20,
  fontWeight: 600,
  marginBottom: 10,
  color: "#000",
},

viewItemInfo: {
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: theme.colors.viewEditBorderColor,
  width: "90%",
  paddingVertical: 5,
  paddingLeft: 10,
  height: 32
},

/*About/Edit styles*/
aboutEditContainer: {
  display: "flex",
  width: theme.spacing.postWidth,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 30
},

editItemContainer: {
  backgroundColor: "#fff",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  paddingHorizontal: 30,
  paddingVertical: 15,
  marginBottom: 20,
  width: theme.spacing.postWidth
},

editItemText: {
  fontSize: 20,
  fontWeight: 600,
  marginBottom: 10,
  color: "#000",
},

editItemInfo: {
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: theme.colors.viewEditBorderColor,
  width: "90%",
  paddingVertical: 5,
  paddingLeft: 10
},

saveButton: {
  width: 100,
  paddingVertical: 10,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: theme.colors.primaryBlue,
  borderRadius: 10,
  marginBottom: 50
},

saveButtonText: {
  color: "#eee",
  textAlign: "center",
  fontSize: 19
}

});

export default styles