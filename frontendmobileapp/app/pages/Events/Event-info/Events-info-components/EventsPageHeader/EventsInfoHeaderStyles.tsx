import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
indEventContainer: {
        width: "100%",
        height: 250,
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginBottom: 30,
    },
    indEventImg: {
        width: "100%",
        height: "100%",
        position: "relative",
    },
    overlayInd: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    eventNameInd: {
        paddingHorizontal: 10,
        paddingTop: 10,
        fontSize: 28,
        color: theme.colors.bannerTextColor,
        fontWeight: 600
    },
    eventLocationInd: {
        paddingHorizontal: 10,
        fontSize: 19,
        color: theme.colors.bannerTextColor,
        marginBottom: 10,
        fontWeight: 400
    },
    favouriteContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        borderRadius: 10,
        padding: 12,
        bottom: -20,
        right: 50,
        zIndex: 1,
        backgroundColor: theme.colors.primaryBlue
    },
    addToEventText: {
        color: "white",
        fontSize: 18,
        
    },
})

export default styles