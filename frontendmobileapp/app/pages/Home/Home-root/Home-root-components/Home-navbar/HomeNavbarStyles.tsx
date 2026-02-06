import theme from "@/assets/variables/Variables";
import { vw } from "@/ts/viewport-units";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    homeNavBarContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: vw(5),
        marginBottom: vw(5),
    },

    homeNavBar: {
        flexDirection: "row",
        flexWrap: "wrap",
        borderWidth: 2,
        width: theme.spacing.postWidth,
        justifyContent: "center",
        backgroundColor: "#fff", 
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },

    indPostNavBarContainer: {
        marginTop: 1,
        marginBottom: 1,
        borderRadius: 0,
    },

    indPostNavBar: {
        borderRadius: 0,
    },

    homeItem: {
        width: "50%",
        paddingVertical: 15,
        alignItems: "center",
    },
    activeHomeItem: {
        position: "relative",
    },
    activeHomeNavText: {
        fontWeight: "bold",
        color: "#000",
    },
    navText: {
        fontSize: 16,
        color: theme.colors.iconNotActive,
        fontWeight: "500",
    },
    activeIndicator: {
        width: 40,
        height: 3,
        backgroundColor: theme.colors.primaryBlue,
        position: "absolute",
        bottom: -2,
    },

})

export default styles 