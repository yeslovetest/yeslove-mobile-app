import { StyleSheet } from "react-native";
import theme from "../../../assets/variables/Variables"

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    height: 65,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    justifyContent: 'space-between',
  },
  iconContainer: {
   width: "20%",
   height: "100%",
   justifyContent: "flex-end",
   paddingBottom: 5,
   alignItems: "center"
  },
  activeIcon: {
    color: theme.colors.primaryBlue,
    fontSize: 24
  },
  icon: {
    color: theme.colors.blackText,
    fontSize: 23,
    display: "flex",
    paddingBottom: 3,
  },
  footerText: {
    fontSize: 12,
    marginTop: 3
  },
    activeText: {
    color: theme.colors.primaryBlue,
    fontWeight: 600,
  },
  newNotification: {
    position: "absolute",
    top: -2,     
    left: 12, 
    width: 12,
    height: 12, 
    borderRadius: "50%",
    backgroundColor: theme.colors.primaryBlue
  }
})

export default styles 