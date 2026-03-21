import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    contentContainer: {
        width: '100%',
        paddingTop: 8,
        paddingBottom: 24,
    },
    headerRow: {
        width: '100%',
        marginBottom: 8,
        paddingHorizontal: 2,
    },
    pageTitle: {
        color: theme.colors.blackText,
        fontSize: 24,
        fontWeight: '700',
    },
    pageSubtitle: {
        marginTop: 4,
        color: theme.colors.iconNotActive,
        fontSize: 14,
        lineHeight: 20,
    },
    viewItemContainer: {
        backgroundColor: "#fff",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 10,
        width: '100%',
        borderRadius: 12,
    },

    viewItemText: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 6,
        color: "#000",
    },

    viewItemInfo: {
        borderWidth: 1,
        borderColor: theme.colors.viewEditBorderColor,
        width: "100%",
        paddingVertical: 10,
        paddingHorizontal: 10,
        minHeight: 42,
        borderRadius: 8,
        color: '#2b2b2b',
    },

    /* Friends list*/

    friend: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },

    friendImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    activeIndicator: {
        width: 40,
        height: 3,
        backgroundColor: theme.colors.primaryBlue,
        position: "absolute",
        bottom: -2,
    },

    friendName: {
        fontSize: 15,
        fontWeight: "500",
        color: "#000",
    },
    friendsContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 8
    },
    friends: {
        flexDirection: "column",
        flexWrap: "wrap",
        width: '100%',
        justifyContent: "flex-start",
        backgroundColor: "#fff",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    friendsItem: {
        width: "100%",
        paddingHorizontal: 4,
        paddingVertical: 10,
        alignItems: "flex-start",
        marginBottom: 8,
    },
    activeFriendsText: {
        fontWeight: "700",
        color: "#000",
        fontSize: 17,
    },

    friendsText: {
        fontWeight: "bold",
        color: "#000",
    },
})


export default styles