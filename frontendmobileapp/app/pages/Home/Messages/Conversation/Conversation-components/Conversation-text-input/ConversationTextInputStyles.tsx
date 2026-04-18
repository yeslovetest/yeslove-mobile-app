import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
 textInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        minHeight: 48,
        maxWidth: 620,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 18,
        backgroundColor: "#fff",
        borderColor: "#d5d9de",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    textInput: {
        flex: 1,
        minHeight: 34,
        maxHeight: 120,
        fontSize: 15,
        lineHeight: 20,
        color: "#1b2430",
        paddingHorizontal: 10,
        paddingTop: 6,
        paddingBottom: 6,
        textAlignVertical: "top",
        includeFontPadding: false,
    },

    sendIcon: {
        padding: 8,
        color: "#fafafa",
        backgroundColor: "#3f7cff",
        borderRadius: 20,
    },
    sendIconDisabled: {
        color: "#eef2f7",
        backgroundColor: "#c6d0e2",
    },
    mediaIcon: {
        padding: 8,
        marginRight: 6,
        color: "#3f7cff",
        backgroundColor: "#eef3ff",
        borderRadius: 20,
    },
   

})

export default styles