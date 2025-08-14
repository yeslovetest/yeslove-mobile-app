import theme from "@/assets/variables/Variables";
import { vw } from "@/ts/viewport-units";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    indBlogContainer: {
        flex: 1,
        width: theme.spacing.postWidth,
        backgroundColor: "#fff",
        marginTop: vw(5),
        borderRadius: 15
    },
    indBlogTitle: {
        marginBottom: vw(5),
        paddingHorizontal: vw(5),
        fontSize: 26,
        fontWeight: 600,
    },
    indAuthorAndDateContainer: {
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        paddingHorizontal: vw(5),
        paddingVertical: vw(5),
        alignItems: "center",
        flexDirection: "row",
        borderBottomColor: "#222",
        borderBottomWidth: 1
    },
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
})

export default styles 