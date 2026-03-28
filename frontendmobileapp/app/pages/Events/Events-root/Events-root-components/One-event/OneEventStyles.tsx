import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    eventsContainer: {
        width: "95%",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    eventContainer: {
        width: "100%",
        height: 185,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        backgroundColor: theme.colors.eventTextBackground,
        marginBottom: 18,
        borderRadius: 15,
        overflow: "hidden",
    },

    eventName: {
        fontSize: 18,
        color: theme.colors.bannerTextColor,
        fontWeight: '700',
        lineHeight: 22,
    },
    eventLocation: {
        marginTop: 4,
        fontSize: 15,
        color: theme.colors.bannerTextColor,
        marginBottom: 2,
        fontWeight: '400'
    },

    dateContainer: {
        position: "absolute",
        height: 48,
        width: 68,
        top: 12,
        left: 12,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(45, 91, 227, 0.88)',
        borderRadius: 12,
        zIndex: 2,
    },
    dateText: {
        color: theme.colors.bannerTextColor,
        fontSize: 13,
        fontWeight: '600',
        textAlign: "center"
    },
    yearText: {
        color: theme.colors.bannerTextColor,
        fontSize: 10,
        textAlign: "center",
        fontWeight: '400'
    },
    eventImg: {
        width: "100%",
        height: "100%",
    },
    eventImageStyle: {
        borderRadius: 10,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.38)',
        borderRadius: 10,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        paddingHorizontal: 14,
        paddingBottom: 12,
    },
    eventTextBlock: {
        width: "100%",
        paddingRight: 8,
    },


})

export default styles