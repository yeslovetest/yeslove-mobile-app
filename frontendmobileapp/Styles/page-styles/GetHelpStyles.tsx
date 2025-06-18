import { StyleSheet } from 'react-native';
import theme from "../Variables";
import { vw } from '@/ts/viewport-units';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    width: theme.spacing.standardPageContentWidth
  },
  contentContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  ourProfessionalsContainer: {
    width: theme.spacing.postWidth,
    height: 115,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bannerOrange,     
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
  ourProfessionalsText: {
    fontSize: 23,
    color: theme.colors.bannerTextColor,
    fontWeight: "bold",   
  },
  ourProfessionalsCaption: {
    fontSize: 15,
    color: theme.colors.bannerTextColor,
    fontWeight: "600", 
  },

  /* Search bar */
  searchBarContainer: {
    marginTop: vw(5),
    width: theme.spacing.postWidth,
    borderRadius: 15,
    padding: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  searchBar: {
    width: "100%",
    height: 43,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
  },

  /* Professional profiles */
  professionalProfileContainer: {
    marginTop: vw(5),
    width: 380,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
  },

  professionalProfileName: {
    marginBottom: 10,
    fontWeight: "600",
    fontSize: 18,
  },

  professionalDescription: {
    color: "#555",
    fontSize: 15,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60, 
    borderWidth: 5,
    borderColor: "#fff",
    marginBottom: 10,
  },

  /*navbar */

  navBarContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 10,
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
        paddingVertical: 10,
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


/*blogs */

blogsContainer: {
    marginTop: 30,
    width: 380,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
},

/*one blog */

blogContainer: {
  display: "flex",
  width: "100%",
  height: 500,
  justifyContent: "flex-start",
  alignItems: "flex-start",
  borderRadius: 15,
},
blogImage: {
  width: "100%",
  height: 250,
},
blogTitle: {
  textAlign: "left",
  paddingHorizontal: 20,
  paddingVertical: 10,
  fontSize: 23,
  fontWeight: "600"
},
authorAndDateContainer: {
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  paddingVertical: 10,
  alignItems: "center",
  flexDirection: "row"
},

authorContainer: {
display: "flex",
alignItems: "center",
flexDirection: "row"
},
authorIcon: {
  color: theme.colors.primaryBlue,
  paddingRight: 3,
}
});

export default styles;
