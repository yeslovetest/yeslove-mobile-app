import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

    textInputContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "97%",
        height: 50,
        paddingHorizontal: 5,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#fff",
        position: "absolute",
        bottom: 10,
        borderColor: "#e1e1e1",
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
        color: "#fbfbfb",
        backgroundColor: theme.colors.primaryBlue,
        borderRadius: "50%"
    },
})

export default styles