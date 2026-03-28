import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    indBlogContainer: {
        width: "100%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    indBlogTitle: {
        marginTop: 16,
        marginBottom: 12,
        paddingHorizontal: 16,
        fontSize: 28,
        lineHeight: 36,
        color: "#1d2735",
        fontWeight: '700',
    },
    indAuthorAndDateContainer: {
        width: "100%",
        justifyContent: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 14,
        borderBottomColor: "#d9e0ec",
        borderBottomWidth: 1
    },
    blogImage: {
        width: "100%",
        minHeight: 220,
        maxHeight: 300,
    },
    blogImageContent: {
        borderRadius: 0,
        resizeMode: "cover",
    },

    authorContainer: {
        alignItems: "center",
        flexDirection: "row",
        maxWidth: "100%",
    },
    authorIcon: {
        color: theme.colors.primaryBlue,
        paddingRight: 7,
    },
    dateAndAuthorText: {
        color: "#5a6478",
        fontSize: 14,
        lineHeight: 18,
        fontWeight: '500',
    },
})

export default styles 