import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "80%",
        paddingHorizontal: 10,
        height: 90,
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
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 4,
        borderWidth: 1,
    },
    messageContainer: {
        width: "70%",
        height: "80%",
        justifyContent: "center",
       

    },
    userUnopened: {
        fontSize: 16,
        fontWeight: 600,
        color: theme.colors.primaryBlue
    },
    userOpened: {
        fontSize: 16,
        fontWeight: 400,
        color: theme.colors.blackText,
        marginBottom: 3
    },

    messageUnopened: {
        fontWeight: 600,
        height: "50%",
        marginBottom: 3
    },

    messageOpened: {
        fontWeight: 400,
        color: "#333"
    },

    timeContainer: {
        width: "35%",
    },

    time: {
        color: theme.colors.iconNotActive,
        fontSize: 11,
        textAlign: "center",
    }

})

export default styles