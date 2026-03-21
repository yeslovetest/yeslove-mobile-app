import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const settingsSharedStyles = StyleSheet.create({
    pageHeaderRow: {
        width: '100%',
        marginBottom: 10,
        paddingHorizontal: 2,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.blackText,
    },
    pageSubtitle: {
        marginTop: 4,
        fontSize: 14,
        lineHeight: 20,
        color: theme.colors.iconNotActive,
    },
    settingsOptionContainer: {
        width: "100%",
        paddingHorizontal: 12,
        borderRadius: 12,
        minHeight: 58,
        marginBottom: 10,
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
    settingsOptionLeftRow: {
        flexDirection: 'row',
        height: '100%',
        alignItems: 'center',
    },
    settingsOptionText: {
        color: theme.colors.blackText,
        marginLeft: 8,
        fontSize: 15,
        fontWeight: '500',
    },
})

export default settingsSharedStyles