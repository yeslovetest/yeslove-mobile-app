import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#f6f8fc',
    },
    contentContainer: {
        width: '100%',
        paddingTop: 14,
        paddingBottom: 32,
        paddingHorizontal: 14,
    },
    headerRow: {
        width: '100%',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    pageTitle: {
        color: theme.colors.blackText,
        fontSize: 26,
        fontWeight: '700',
    },
    pageSubtitle: {
        marginTop: 6,
        color: theme.colors.iconNotActive,
        fontSize: 14,
        lineHeight: 20,
    },
    viewItemContainer: {
        backgroundColor: "#fff",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 14,
        width: '100%',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e5e9f2',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },

    viewItemText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6f7b91',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },

    fieldLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },

    fieldIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eef3ff',
    },

    fieldIcon: {
        color: '#2f5be7',
    },

    viewItemInfo: {
        width: "100%",
        paddingVertical: 2,
        color: '#0f172a',
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
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