import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    messageContainer: {
        width: '100%',
        backgroundColor: theme.colors.mainBkgColor,
        padding: 10,
    },
    messageContent: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    messageImageIcon: {
        width: 50,
        height: 50,
        borderRadius: 60,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    messageHeaderText: {
        fontSize: 15,
        fontWeight: '500',
        marginHorizontal: 20,
    },
})

export default styles;