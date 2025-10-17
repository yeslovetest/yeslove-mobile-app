import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
       chatResponseContainer: {
        width: "90%",
        marginRight: "auto",
        padding: 20,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        marginBottom: 4
    },

    chatResponse: {
        fontFamily: "sans-serif",
        width: "100%",
        borderRadius: 15,
        backgroundColor: "#f1f1f1",
        color: "#4e4e4e",
        paddingVertical: 15,
        paddingHorizontal: 10,
        fontSize: 17
    },

    timeSentResponse: {
        marginTop: 2,
        marginLeft: "auto",
        color: "#4e4e4e"
    },
})

export default styles