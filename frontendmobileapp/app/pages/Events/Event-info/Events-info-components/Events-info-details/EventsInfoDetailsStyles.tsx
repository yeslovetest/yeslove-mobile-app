import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

    eventInfo: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    addressContainer: {
        width: theme.spacing.postWidth,
        padding: theme.spacing.eventTextBoxPadding,
        backgroundColor: theme.colors.eventTextBackground,
        borderRadius: 10,
        marginBottom: 30,
    },
    addressHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5
    },
    eventAddress: {
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 22,
    },
    dateAndTimeContainer: {
        width: theme.spacing.postWidth,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 30
    },

    dateContainer2: {
        padding: theme.spacing.eventTextBoxPadding,
        backgroundColor: theme.colors.eventTextBackground,
        borderRadius: 10,
        width: "47%"
    },
    dateHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5
    },

    eventDate: {
        fontSize: 15,
        fontWeight: '400',
    },

    timeContainer: {
        padding: theme.spacing.eventTextBoxPadding,
        backgroundColor: theme.colors.eventTextBackground,
        borderRadius: 10,
        width: "47%"
    },
    timeHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5
    },
    eventTime: {
        fontSize: 15,
        fontWeight: '400',
    },
    extraInfoContainer: {
        width: theme.spacing.postWidth,
        backgroundColor: theme.colors.eventTextBackground,
        minHeight: 180,
        borderRadius: 10,
        padding: theme.spacing.eventTextBoxPadding,
        marginBottom: 30
    },
    extraInfoHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    eventExtraInfo: {
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 22,
    }
})

export default styles