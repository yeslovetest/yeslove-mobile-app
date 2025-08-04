import { StyleSheet } from "react-native";
import theme from "../Variables"

const styles = StyleSheet.create({
   container: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 2,
    width: '100%',
    backgroundColor: theme.colors.mainBkgColor

   },
   mainText :{
    fontSize: 15,
    backgroundColor: theme.colors.mainBkgColor,
   },

   outerBox: {
    backgroundColor: theme.colors.mainBkgColor,
    borderWidth: 1,
    borderBlockColor: theme.colors.blackText,
    height: 20,
    width: 20,
    padding: 2,
   },
   innerBox: {
    backgroundColor: theme.colors.blackText,
    height: '100%',
    width: '100%',
   },
})

export default styles;