import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        height: 70,
        marginVertical: 8,
        width: "100%",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    profileName: {
        marginBottom: 7,
        fontWeight: "600",
        fontSize: 16,
    },
    profileImage: {
        width: 55,
        height: 55,
        borderRadius: 60,
        borderWidth: 1,
        borderColor: "#ccc",
    },

    profileImageContainer: {
        marginLeft: 5,
        height: "100%",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        alignSelf: "flex-start",
        flexDirection: "row"
    },
    profileInfoContainer: {
        paddingStart: 10,
        justifyContent: "center",

    },
})

export default styles 