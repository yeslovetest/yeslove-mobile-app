import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
   chatResponseContainer: {
        width: "90%",
        marginRight: "auto",
        padding: 20,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 4
    },

    chatResponse: {
        fontFamily: "sans-serif",
        width: "100%",
        borderRadius: 15,
        backgroundColor: "#fefefe",
        color: "#4e4e4e",
        padding: 10,
        fontSize: 17
    },

    responseText: {
        fontSize: 17,
        fontFamily: "sans-serif",
        color: "#1e1e1e",
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
        color: "#7e7e7e"
    },

})

export default styles