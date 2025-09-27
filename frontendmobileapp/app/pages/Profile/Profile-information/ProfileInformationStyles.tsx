import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 15
    },
    viewItemContainer: {
        backgroundColor: "#fff",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingHorizontal: 30,
        paddingVertical: 15,
        marginBottom: 20,
        width: theme.spacing.postWidth,
    },

    viewItemText: {
        fontSize: 20,
        fontWeight: 600,
        marginBottom: 10,
        color: "#000",
    },

    viewItemInfo: {
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: theme.colors.viewEditBorderColor,
        width: "90%",
        paddingVertical: 5,
        paddingLeft: 10,
        height: 32
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
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
    },
    friendsContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10
    },
    friends: {
        flexDirection: "column",
        flexWrap: "wrap",
        width: theme.spacing.postWidth - 50,
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
        width: "50%",
        paddingHorizontal: 5,
        paddingVertical: 15,
        alignItems: "flex-start",
        marginBottom: 15,
    },
    activeFriendsText: {
        fontWeight: "bold",
        color: "#000",
        fontSize: 19
    },

    friendsText: {
        fontWeight: "bold",
        color: "#000",
    },
})


export default styles