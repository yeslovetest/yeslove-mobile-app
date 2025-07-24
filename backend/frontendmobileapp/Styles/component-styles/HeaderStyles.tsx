import { StyleSheet } from "react-native";
import theme from "../Variables";

const styles = StyleSheet.create({
    header: {
        width: '100%',
        height: 60,
        backgroundColor: '#fff', 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingLeft: 20, 
        paddingTop: 5,
        marginTop: 0,
        justifyContent: 'space-between', 
      },
      title: {
        color: theme.colors.primaryBlue,
        fontSize: 20,
        fontWeight: 'bold',
      },
      profile: {
        marginRight: 15,
      }
})

export default styles 