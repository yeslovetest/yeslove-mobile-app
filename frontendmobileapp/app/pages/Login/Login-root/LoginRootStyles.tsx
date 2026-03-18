import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 28,
    },
    title: {
        marginTop: 16,
        fontSize: 22,
        fontWeight: "700",
        color: "#1f2937",
        textAlign: "center",
    },
    message: {
        marginTop: 10,
        fontSize: 15,
        color: "#5f6b7a",
        textAlign: "center",
        lineHeight: 22,
        maxWidth: 360,
    },
})

export default styles