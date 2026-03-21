import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
navBarContainer: {
  flex: 1,
  justifyContent: "flex-start",
  alignItems: "center",
  marginTop: 12,
},
navBar: {
  flexDirection: "row",
  flexWrap: "wrap", 
  width: "100%", 
  justifyContent: "center",
  backgroundColor: "#fff",
  paddingVertical: 8,
  borderRadius: 10, 
  elevation: 3, 
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
navItem: {
  width: "50%",
  paddingVertical: 12,
  alignItems: "center",
},
navText: {
  fontSize: 15,
  color: theme.colors.iconNotActive,
  fontWeight: "500",
},
activeNavItem: {
  position: "relative",
},
activeNavText: {
  fontWeight: "700",
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
})

export default styles 