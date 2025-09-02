import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    chatMessageContainer: {
        width: "100%",
        padding: 15,
        marginBottom: 4,
        marginTop: "auto"
    },
    messageAndTimeSentContainer: {
        marginLeft: "auto",
        maxWidth: "50%",
    },

    chatMessage: {
        marginLeft: "auto",
        borderRadius: 15,
        backgroundColor: "#2d5be3",
        padding: 10
    },

    messageText: {
        color: "#f5f5f5",
        fontSize: 17,
        fontFamily: "sans-serif",
    },

    timeSentMessage: {
        marginTop: 2,
        marginLeft: "auto",
        color: "#fefefe"
    },


})

export default styles