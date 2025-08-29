import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
      container: {
        flex: 1,
        marginTop: 15
    },
    saveButton: {
        width: 100,
        paddingVertical: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.primaryBlue,
        borderRadius: 10,
        marginBottom: 50
    },

    saveButtonText: {
        color: "#eee",
        textAlign: "center",
        fontSize: 19
    },
})

export default styles