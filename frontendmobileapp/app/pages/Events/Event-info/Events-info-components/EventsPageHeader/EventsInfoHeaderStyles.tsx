import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    indEventContainer: {
        width: "94%",
        aspectRatio: 4 / 3,
        maxHeight: 330,
        minHeight: 260,
        alignSelf: "center",
        borderRadius: 18,
        overflow: "hidden",
        marginBottom: 22,
        backgroundColor: "#edf1f8",
    },
    indEventImg: {
        width: "100%",
        height: "100%",
    },
    indEventImageStyle: {
        borderRadius: 18,
    },
    overlayInd: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.36)',
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        paddingBottom: 18,
        paddingTop: 72,
    },
    eventMetaContainer: {
        marginBottom: 10,
    },
    eventDateChip: {
        color: "#fff",
        backgroundColor: "rgba(45, 91, 227, 0.9)",
        fontSize: 12,
        fontWeight: "600",
        overflow: "hidden",
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 10,
        textTransform: "uppercase",
        letterSpacing: 0.2,
    },
    eventNameInd: {
        fontSize: 26,
        color: theme.colors.bannerTextColor,
        fontWeight: "700",
        lineHeight: 31,
    },
    eventLocationInd: {
        marginTop: 6,
        fontSize: 16,
        color: theme.colors.bannerTextColor,
        fontWeight: "500",
        opacity: 0.95,
    },
    favouriteContainer: {
        position: "absolute",
        borderRadius: 14,
        paddingVertical: 0,
        paddingHorizontal: 0,
        top: 12,
        right: 12,
        zIndex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        overflow: "hidden",
    },
    favouritePressable: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    addToEventText: {
        color: theme.colors.primaryBlue,
        fontSize: 13,
        fontWeight: "700",
    },
    attendingText: {
        color: "#1f2a3d",
    },
})

export default styles