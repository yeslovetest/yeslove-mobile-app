import { StyleSheet } from "react-native";
import theme from "../../Styles/Variables"

const styles = StyleSheet.create({
    footer: {
        width: '100%',
        height: 60,
        backgroundColor: '#fff', 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: 0,
        padding: 15,
        justifyContent: 'space-between', 
      },
      activeIcon: {
        color: theme.colors.primaryBlue
    },
  icon: {
    color: theme.colors.iconNotActive,
    fontSize: 20,
    display: "flex",
    paddingBottom: 3,
    justifyContent: "center",
    alignItems: "center"
}
})

export default styles 