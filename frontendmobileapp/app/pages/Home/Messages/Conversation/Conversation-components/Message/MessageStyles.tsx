import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    chatMessageContainer: {
        width: "100%",
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    messageAndTimeSentContainer: {
        marginLeft: "auto",
        maxWidth: "80%",
        minWidth: "24%",
    },

    chatMessage: {
        position: 'relative',
        borderRadius: 18,
        borderBottomRightRadius: 10,
        backgroundColor: "#2f6cf6",
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 6,
    },
    tailSent: {
        position: 'absolute',
        right: -6,
        bottom: 8,
        width: 12,
        height: 12,
        borderRadius: 8,
        backgroundColor: '#2f6cf6',
        transform: [{ rotate: '-28deg' }],
    },

    messageText: {
        color: "#f8fbff",
        fontSize: 15,
        lineHeight: 21,
        marginTop: 4,
        marginBottom: 2,
    },

    timeSentMessage: {
        marginTop: 2,
        marginLeft: "auto",
        color: "#dbe8ff",
        fontSize: 11,
    },


})

export default styles