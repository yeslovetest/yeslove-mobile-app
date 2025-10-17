import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    botProfile: {
        marginLeft: -10,
        width: 45,
        height: 45,
        borderRadius: "50%",
        marginRight: 9,
        backgroundColor: "#fefefe",
        borderColor: "#cbcbcb",
        borderWidth: 1,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        overflow: "hidden"
    },

    botProfileImagee: {
        width: 60,
        height: 60
    },

    onlineNow: {
        fontSize: 11,
        color: "#fbfbfb"
    },

    onlineSymbol: {
        width: 7,
        height: 7,
        backgroundColor: "#3fe86c",
        borderRadius: "50%",
        marginRight: 3
    },

    onlineNowContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        marginLeft: 15,
    },

    headerContainer: {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "row",
        height: 60,
        borderBottomColor: "#fff",
        borderBottomWidth: 1,
    },
    chatbot: {
        fontWeight: 500,
        fontSize: 16,
        color: "#fbfbfb"
    },


})

export default styles