import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
 textInputContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "93%",
        height: 40,
        paddingHorizontal: 3,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: "#fff",
        position: "absolute",
        bottom: 10,
        borderColor: "#c1c1c1",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3.84,
        elevation: 5
    },
    textInput: {
        width: "90%",
        height: "100%",
        fontSize: 17,
        paddingHorizontal: 10
    },

    sendIcon: {
        marginLeft: "auto",
        padding: 6,
        color: "#fafafa",
        backgroundColor: "#c9c9c9",
        borderRadius: "50%"
    },

})

export default styles