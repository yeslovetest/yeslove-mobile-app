import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 8,
        minHeight: 84,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
       
    },

    activeIndicator: {
        height: "100%",
        width: 7,
        backgroundColor: theme.colors.primaryBlue,
        position: "absolute",
        left: -2,
    },
    activeBackgroundColor: {
        backgroundColor: "#fff"
    },
    profilePicture: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 8,
        borderWidth: 1,
    },
    messageContainer: {
        flex: 1,
        paddingRight: 8,
        justifyContent: "center",
    },
    userUnopened: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.primaryBlue
    },
    userOpened: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.blackText,
        marginBottom: 2,
    },

    messageUnopened: {
        fontWeight: '600',
        marginBottom: 2,
        color: '#1f1f1f',
    },

    messageOpened: {
        fontWeight: '400',
        color: "#4e4e4e"
    },

    timeContainer: {
        width: 78,
        alignItems: 'flex-end',
    },

    time: {
        color: theme.colors.iconNotActive,
        fontSize: 11,
        textAlign: "center",
    }

})

export default styles