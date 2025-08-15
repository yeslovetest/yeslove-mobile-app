import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
aboutNavBarContainer: {
  flex: 1,
  justifyContent: "flex-start",
  alignItems: "center",
  marginTop: 15,
  marginBottom: 15
},
activeIndicator: {
  width: 40,
  height: 3,
  backgroundColor: theme.colors.primaryBlue, 
  position: "absolute",
  bottom: -2, 
},
navText: {
  fontSize: 16,
  color: theme.colors.iconNotActive,
  fontWeight: "500",
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
})

export default styles 