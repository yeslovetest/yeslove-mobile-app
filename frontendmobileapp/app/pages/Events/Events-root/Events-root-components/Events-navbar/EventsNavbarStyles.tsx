import theme from "@/assets/variables/Variables";
import { vw } from "@/ts/viewport-units";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    navBarContainer: {
        flex: 0,
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 6,
        width: '100%',
    },
    navBar: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: '100%',
        justifyContent: "center",
        backgroundColor: "#fff",
        paddingVertical: 8,
        borderRadius: 15,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    navItem: {
        width: "33%",
        paddingVertical: 11,
        alignItems: "center",
    },
    navText: {
        fontSize: 14,
        color: theme.colors.iconNotActive,
        fontWeight: "500",
    },
    activeNavItem: {
        position: "relative",
    },
    activeNavText: {
        fontWeight: "700",
        color: "#000",
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