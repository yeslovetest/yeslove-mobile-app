import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const sharedStyles = StyleSheet.create({
   settingsNavItemContent: {
  alignItems: 'center',
  paddingVertical: 15,
  marginVertical: 2,
  paddingHorizontal: 50,
  backgroundColor: theme.colors.mainBkgColor,
},

headerText: {
  backgroundColor: theme.colors.mainBkgColor,
  fontSize: 15,
  paddingVertical: 10,
  paddingHorizontal: 10,
  color: theme.colors.blackText,
  fontWeight: 'bold'
},
headerText2: {
  paddingVertical: 10,
  fontSize: 17,
  paddingHorizontal: 0,
},
})

export default sharedStyles
