import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    blogContainer: {
        display: "flex",
        width: "100%",
        backgroundColor: "#fff",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        borderRadius: 15,
        marginBottom: 40,
    },
    blogImage: {
        width: "100%",
        height: 250,
    },
    blogTitle: {
        textAlign: "left",
        paddingHorizontal: 30,
        paddingVertical: 10,
        marginTop: 15,
        fontSize: 23,
        fontWeight: "600"
    },
    authorAndDateContainer: {
        display: "flex",
        width: "100%",
        justifyContent: "flex-start",
        paddingHorizontal: 30,
        paddingVertical: 10,
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
        paddingHorizontal: 30,
        paddingVertical: 10,
        marginBottom: 20,
        color: "#444",
        fontSize: 16
    },
})

export default styles