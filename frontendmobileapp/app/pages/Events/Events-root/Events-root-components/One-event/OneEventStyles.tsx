import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
        eventsContainer: {
        width: theme.spacing.postWidth,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
    },
eventContainer: {
        width: "90%",
    minHeight: 150,
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        backgroundColor: theme.colors.eventTextBackground,
        marginBottom: 18,
        borderRadius: 15,

    },

    eventName: {
        paddingHorizontal: 10,
        fontSize: 18,
        color: theme.colors.bannerTextColor,
        fontWeight: '600'
    },
    eventLocation: {
        paddingHorizontal: 10,
        fontSize: 16,
        color: theme.colors.bannerTextColor,
        marginBottom: 10,
        fontWeight: '400'
    },

    dateContainer: {
        position: "absolute",
        height: 55,
        width: 80,
        top: 48,
        left: -20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.primaryBlue,
        borderRadius: 10,
        zIndex: 2,
    },
    dateText: {
        color: theme.colors.bannerTextColor,
        fontSize: 14,
        fontWeight: '600',
        textAlign: "center"
    },
    yearText: {
        color: theme.colors.bannerTextColor,
        fontSize: 11,
        textAlign: "center",
        fontWeight: '400'
    },
    eventImg: {
        width: "100%",
        height: "100%",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 10,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
    },


})

export default styles