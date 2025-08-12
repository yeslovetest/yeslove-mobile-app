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
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
},

/*one blog */

blogContainer: {
  display: "flex",
  width: "100%",
  backgroundColor: "#fff",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  borderRadius: 15,
  marginBottom: 40,
},
blogImage: {
  width: "100%",
  height: 250,
},
blogTitle: {
  textAlign: "left",
  paddingHorizontal: 30,
  paddingVertical: 10,
  marginTop: 15,
  fontSize: 23,
  fontWeight: "600"
},
authorAndDateContainer: {
  display: "flex",
  width: "100%",
  justifyContent: "flex-start",
  paddingHorizontal: 30,
  paddingVertical: 10,
  alignItems: "center",
  flexDirection: "row"
},

authorContainer: {
display: "flex",
alignItems: "center",
flexDirection: "row",
marginRight:  30
},
authorIcon: {
  color: theme.colors.primaryBlue,
  paddingRight: 5,
},
dateAndAuthorText: {
  color: "#666",
  fontSize: 14
},
blogSummary: {
  paddingHorizontal: 30,
  paddingVertical: 10,
  marginBottom: 20,
  color: "#444",
  fontSize: 16
},

/*indiividual blogs */

indBlogContainer: {
  flex: 1,
  width: theme.spacing.postWidth,
  backgroundColor: "#fff",
  marginTop: vw(5),
  borderRadius: 15

},
indBlogTitle: {
  marginBottom: vw(5),
  paddingHorizontal: vw(5),
  fontSize: 26,
  fontWeight: 600,
},
indAuthorAndDateContainer: {
    display: "flex",
  width: "100%",
  justifyContent: "space-between",
  paddingHorizontal: vw(5),
  paddingVertical: vw(5),
  alignItems: "center",
  flexDirection: "row",
  borderBottomColor: "#222",
  borderBottomWidth: 1
},
blogContentText: {
  paddingHorizontal: vw(5),
  paddingVertical: vw(5),
  textAlign: "justify",
  color: "#222"
}
});

export default styles;
