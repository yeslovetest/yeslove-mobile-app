import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    blogContainer: {
        display: "flex",
        width: "100%",
        backgroundColor: "#fff",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        borderRadius: 12,
        marginBottom: 16,
    },
    blogImage: {
        width: "100%",
        minHeight: 170,
        maxHeight: 240,
    },
    blogTitle: {
        textAlign: "left",
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginTop: 10,
        fontSize: 20,
        lineHeight: 28,
        fontWeight: "600"
    },
    authorAndDateContainer: {
        display: "flex",
        width: "100%",
        justifyContent: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: "center",
        flexDirection: "row"
    },

    authorContainer: {
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        marginRight: 30
    },
    authorIcon: {
        color: theme.colors.primaryBlue,
        paddingRight: 5,
    },
    dateAndAuthorText: {
        color: "#666",
        fontSize: 14
    },
    blogSummary: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 14,
        color: "#444",
        fontSize: 15,
        lineHeight: 22,
    },
})

export default styles