import { vw } from "@/ts/viewport-units";
import { StyleSheet } from "react-native";
import theme from "../Variables";

export const styles = StyleSheet.create({
    ourProfessionalsContainer: {
    width: theme.spacing.postWidth,
    height: 115,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bannerOrange,     
    marginTop: vw(5)
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
})

export default styles