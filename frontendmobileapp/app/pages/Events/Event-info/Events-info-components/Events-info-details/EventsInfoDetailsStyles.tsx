import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

    eventInfo: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    addressContainer: {
        width: "94%",
        paddingVertical: 16,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.eventTextBackground,
        borderRadius: 14,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "#e7ecf4",
    },
    addressHeader: {
        fontSize: 13,
        fontWeight: "700",
        color: "#516077",
        marginBottom: 7,
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    eventAddress: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        color: "#1f2a3d",
    },
    dateAndTimeContainer: {
        width: "94%",
        justifyContent: "space-between",
        flexDirection: "row",
        marginBottom: 18,
    },

    dateContainer2: {
        paddingVertical: 14,
        paddingHorizontal: 14,
        backgroundColor: theme.colors.eventTextBackground,
        borderRadius: 14,
        width: "48.5%",
        borderWidth: 1,
        borderColor: "#e7ecf4",
    },
    dateHeader: {
        fontSize: 12,
        fontWeight: "700",
        color: "#516077",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },

    eventDate: {
        fontSize: 15,
        fontWeight: '600',
        color: "#1f2a3d",
    },

    timeContainer: {
        paddingVertical: 14,
        paddingHorizontal: 14,
        backgroundColor: theme.colors.eventTextBackground,
        borderRadius: 14,
        width: "48.5%",
        borderWidth: 1,
        borderColor: "#e7ecf4",
    },
    timeHeader: {
        fontSize: 12,
        fontWeight: "700",
        color: "#516077",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    eventTime: {
        fontSize: 15,
        fontWeight: '600',
        color: "#1f2a3d",
    },
    extraInfoContainer: {
        width: "94%",
        backgroundColor: theme.colors.eventTextBackground,
        minHeight: 190,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 15,
        marginBottom: 26,
        borderWidth: 1,
        borderColor: "#e7ecf4",
    },
    extraInfoHeader: {
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 8,
        color: "#516077",
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    eventExtraInfo: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        color: "#1f2a3d",
    }
})

export default styles