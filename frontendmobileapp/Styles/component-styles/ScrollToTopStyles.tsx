import { StyleSheet } from "react-native";
import theme from "../../Styles/Variables"

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 90,
        right: 100,
        backgroundColor: theme.colors.primaryBlue,
        opacity: 0.7,
        width: 45,
        height: 45,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    }, 

    buttonIcon: {
        color: theme.colors.mainBkgColor,
        fontWeight: 'bold',
        fontSize: 36,
    }
})

export default styles;