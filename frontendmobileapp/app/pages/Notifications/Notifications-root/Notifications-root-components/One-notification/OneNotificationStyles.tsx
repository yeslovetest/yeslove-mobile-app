import theme from "@/assets/variables/Variables";
import { vw } from "@/ts/viewport-units";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: "100%",
        alignItems: 'center',
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingRight: 15,
        paddingLeft: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    activeIndicator: {
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: theme.colors.primaryBlue,
        position: "absolute",
        left: 10,
    },
    activeBackgroundColor: {
        backgroundColor: "#fff"
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    username: {
        fontWeight: '600',
        fontSize: 14,
        color: '#222',
    },
    usernameUnopened: {
        fontSize: 15,
        fontWeight: 600,
        color: theme.colors.primaryBlue
    },
    messageText: {
        fontSize: 14,
        color: '#333',
    },
    timeText: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    postImage: {
        width: 48,
        height: 48,
        borderRadius: 6,
        marginLeft: 12,
    },
})

export default styles