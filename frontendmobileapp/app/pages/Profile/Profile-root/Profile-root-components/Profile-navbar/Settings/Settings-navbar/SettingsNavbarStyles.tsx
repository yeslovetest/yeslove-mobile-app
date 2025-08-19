import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    settingsNavBar: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: theme.spacing.postWidth - 50,
        justifyContent: "center",
        backgroundColor: "#fff",
        paddingVertical: 3,
        marginVertical: 15,
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    settingsItem: {
        width: "50%",
        paddingVertical: 15,
        alignItems: "center",
    },
    activeSettingsItem: {
        position: "relative",
    },
    activeSettingsNavText: {
        fontWeight: "bold",
        color: "#000",
    },
    navText: {
        fontSize: 16,
        color: theme.colors.iconNotActive,
        fontWeight: "500",
    },
    activeIndicator: {
        width: 40,
        height: 3,
        backgroundColor: theme.colors.primaryBlue,
        position: "absolute",
        bottom: -2,
    },
    settingsNavItem: {
        paddingVertical: 15,
        alignItems: "center",
    },
})

export default styles 