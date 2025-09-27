import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const settingsSharedStyles = StyleSheet.create({
    settingsOptionContainer: {
        width: "100%",
        paddingHorizontal: 10,
        borderRadius: 15,
        height: 60,
        marginBottom: 11,
        backgroundColor: "white",
        flexDirection: "row",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },

    settingsOptionButton: {
        width: "100%",
        height: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row"
    },
    settingsOptionText: {
        color: theme.colors.blackText,
        marginLeft: 8,
        fontSize: 16
    },
})

export default settingsSharedStyles