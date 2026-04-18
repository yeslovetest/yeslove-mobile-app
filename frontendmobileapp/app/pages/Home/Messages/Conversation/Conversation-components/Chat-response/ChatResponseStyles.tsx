import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
   chatResponseContainer: {
        width: "100%",
        paddingHorizontal: 10,
        paddingVertical: 4,
        justifyContent: "flex-start",
        alignItems: "flex-end",
        flexDirection: "row",
        gap: 6,
    },

    chatResponse: {
        position: 'relative',
        width: "100%",
        maxWidth: "80%",
        minWidth: "24%",
        borderRadius: 18,
        borderBottomLeftRadius: 10,
        backgroundColor: "#edf3ff",
        borderWidth: 1,
        borderColor: "#d9e6ff",
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 6,
    },
    tailReceived: {
        position: 'absolute',
        left: -6,
        bottom: 8,
        width: 12,
        height: 12,
        borderRadius: 8,
        backgroundColor: '#edf3ff',
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#d9e6ff',
        transform: [{ rotate: '28deg' }],
    },

    responseText: {
        fontSize: 15,
        lineHeight: 21,
        color: "#111827",
        marginTop: 4,
        marginBottom: 2,
    },

    timeSentResponseContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
    },

    timeSentResponse: {
        marginTop: 2,
        marginLeft: "auto",
        color: "#6b7280",
        fontSize: 11,
    },

})

export default styles