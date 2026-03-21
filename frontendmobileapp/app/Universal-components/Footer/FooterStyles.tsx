import { StyleSheet } from "react-native";
import theme from "../../../assets/variables/Variables"

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    minHeight: 64,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopColor: '#e8e8e8',
    borderTopWidth: 1,
  },
  iconContainer: {
   width: "20%",
    minHeight: 48,
    justifyContent: "center",
    paddingBottom: 2,
   alignItems: "center"
  },
  activeIcon: {
    color: theme.colors.primaryBlue,
    fontSize: 24
  },
  icon: {
    color: theme.colors.blackText,
    fontSize: 22,
    display: "flex",
    paddingBottom: 3,
  },
  footerText: {
    fontSize: 11,
    marginTop: 2,
    color: theme.colors.iconNotActive,
  },
    activeText: {
    color: theme.colors.primaryBlue,
    fontWeight: '600',
  },
  newNotification: {
    position: "absolute",
    top: -2,     
    left: 12, 
    width: 12,
    height: 12, 
    borderRadius: 6,
    backgroundColor: theme.colors.primaryBlue
  }
})

export default styles 