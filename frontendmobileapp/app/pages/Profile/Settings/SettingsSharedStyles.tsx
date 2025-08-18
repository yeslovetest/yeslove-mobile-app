import { StyleSheet } from "react-native";

const settingsSharedStyles = StyleSheet.create({
    settingsOptionContainer: {
        width: "100%",
        paddingHorizontal: 10,
        borderRadius: 15,
        height: 70,
        marginBottom: 15,
        backgroundColor: "white",
        flexDirection: "row"
    },

    settingsOptionButton: {
        width: "100%",
        height: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row"
    },
    settingsOptionText: {
        marginLeft: 8,
        fontSize: 18
    },
})

export default settingsSharedStyles