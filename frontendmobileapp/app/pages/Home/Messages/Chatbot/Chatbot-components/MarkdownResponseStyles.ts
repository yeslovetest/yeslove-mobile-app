/*markdown response styles for chatbot answers, used in ChatResponse component*/
const markdownStyles = {
    body: {
        color: "#334155",
        fontSize: 15,
        lineHeight: 23,
    },

    heading1: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 10,
        marginTop: 14,
        color: "#0f172a",
    },

    heading2: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
        marginTop: 10,
        color: "#0f172a",
    },

    heading3: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 6,
        marginTop: 8,
        color: "#1e293b",
    },

    paragraph: {
        marginBottom: 10,
    },

    strong: {
        fontWeight: "700",
        color: "#0f172a",
    },

    em: {
        fontStyle: "italic",
        color: "#475569",
    },

    link: {
        color: "#0f5ea8",
        textDecorationLine: "underline",
    },

    bullet_list: {
        marginBottom: 10,
        paddingLeft: 2,
    },

    ordered_list: {
        marginBottom: 10,
        paddingLeft: 2,
    },

    list_item: {
        flexDirection: "row",
        marginBottom: 6,
    },

    blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: "#bfdbfe",
        backgroundColor: "#f8fafc",
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginVertical: 8,
        borderRadius: 8,
    },

    code_inline: {
        backgroundColor: "#eef2ff",
        color: "#3730a3",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        fontSize: 13,
    },

    code_block: {
        backgroundColor: "#0f172a",
        color: "#e2e8f0",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginVertical: 8,
        fontSize: 13,
    },

    fence: {
        backgroundColor: "#0f172a",
        color: "#e2e8f0",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginVertical: 8,
        fontSize: 13,
    },

    hr: {
        backgroundColor: "#e2e8f0",
        height: 1,
        marginVertical: 12,
    },
};

export default markdownStyles;