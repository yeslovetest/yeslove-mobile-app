import { StyleSheet } from "react-native";
import theme from "../Variables";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: theme.spacing.standardPageContentWidth,
    },
    contentContainer: {
        width: "100%",
    },
    title: {
        fontSize: 36,
        fontWeight: '400',
        color: '#333',
        width: "100%",
        margin: 10
    },

    /* nav bar */

    navBarContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 10,
    },
    navBar: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: theme.spacing.postWidth,
        justifyContent: "center",
        backgroundColor: "#fff",
        paddingVertical: 10,
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    navItem: {
        width: "33%",
        paddingVertical: 10,
        alignItems: "center",
    },
    navText: {
        fontSize: 16,
        color: theme.colors.iconNotActive,
        fontWeight: "500",
    },
    activeNavItem: {
        position: "relative",
    },
    activeNavText: {
        fontWeight: "bold",
        color: "#000",
    },
    activeIndicator: {
        width: 40,
        height: 3,
        backgroundColor: theme.colors.primaryBlue,
        position: "absolute",
        bottom: -2,
    },

    /* events list */

    eventsContainer: {
        width: theme.spacing.postWidth,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 20,
    },

    eventContainer: {
        width: "90%",
        height: 150,
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        backgroundColor: theme.colors.eventTextBackground,
        marginBottom: 30,
        borderRadius: 10,

    },

    eventName: {
        paddingHorizontal: 10,
        fontSize: 20,
        color: theme.colors.bannerTextColor,
        fontWeight: 400
    },
    eventLocation: {
        paddingHorizontal: 10,
        fontSize: 16,
        color: theme.colors.bannerTextColor,
        marginBottom: 10,
        fontWeight: 200
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
        fontWeight: 400,
        textAlign: "center"
    },
    yearText: {
        color: theme.colors.bannerTextColor,
        fontSize: 11,
        textAlign: "center",
        fontWeight: 200
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

    /*individual events page */

    indEventsContainer: {
        width: "100%",
        flex: 1,
    },
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
        width: 65,
        height: 65,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        borderRadius: "50%",
        bottom: -20,
        right: 50,
        zIndex: 1,
        backgroundColor: theme.colors.primaryBlue
    },
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
        fontWeight: 200,
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
        fontWeight: 200,
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
        fontWeight: 200,
    },
    extraInfoContainer: {
        width: theme.spacing.postWidth,
        backgroundColor: theme.colors.eventTextBackground,
        height: 300,
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
        fontWeight: 200,
    }

})

export default styles