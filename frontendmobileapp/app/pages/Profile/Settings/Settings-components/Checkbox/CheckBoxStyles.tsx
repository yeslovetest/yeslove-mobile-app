import { StyleSheet } from "react-native";
import theme from "@/assets/variables/Variables";

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
    mainText: {
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

export default styles;