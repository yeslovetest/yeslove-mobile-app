import theme from "@/assets/variables/Variables"
import { StyleSheet } from "react-native"

const styles = StyleSheet.create({

    /* header */

    headerContainer: {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "row",
        height: 60,
        borderBottomColor: "#fff",
        borderBottomWidth: 1,
    },
    headerText: {
        textAlign: "center",
        fontSize: 24,
        color: "#10344A",
        fontWeight: 500,
    },

    onlineNowContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        marginLeft: 15,
    },

    headerProfile: {
        width: 38,
        height: 38,
        borderRadius: 19,
        marginRight: 10,
        backgroundColor: "#fbfbfb",
        borderColor: "#cbcbcb",
        borderWidth: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },

    headerBotProfileImage: {
        color: "#fbfbfb",
        marginBottom: 2,
        fontSize: 20
    },

    chatbot: {
        fontWeight: 500,
        fontSize: 16,
        color: "#fbfbfb"
    },

    onlineNow: {
        fontSize: 11,
        color: "#fbfbfb"
    },

    onlineSymbol: {
        width: 7,
        height: 7,
        backgroundColor: "#3fe86c",
        borderRadius: 4,
        marginRight: 3
    },

    dots: {
        color: "#10344A",
        marginLeft: "auto",
        padding: 8,
    },

    /*containers */

    outerView: {
        flex: 1,
        flexGrow: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
    },


    contentContainer: {
        flexGrow: 1,
        backgroundColor: theme.colors.mainBkgColor,
        paddingBottom: "8%"
    },
    backgroundContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
    },
    background: {
        height: "100%",
        width: "100%",
        backgroundColor: "#fbfbfb",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    container: {
        flex: 1,
        width: "100%",
    },

    /*greeting container */

    greetingContainer: {
        display: "flex",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    chatIcon: {
        color: "#fbfbfb"
    },

    greetingRobot: {
        height: 300,
        width: 300
    },



    /*text input */
    textInputContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "97%",
        height: 50,
        paddingHorizontal: 5,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#fff",
        position: "absolute",
        bottom: 10,
        borderColor: "#e1e1e1",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3.84,
        elevation: 5
    },
    textInput: {
        width: "90%",
        height: "100%",
        fontSize: 17,
        paddingHorizontal: 10
    },

    sendIcon: {
        marginLeft: "auto",
        padding: 6,
        color: "#fbfbfb",
        backgroundColor: theme.colors.primaryBlue,
        borderRadius: 20
    },

    /*chat prompt */

    chatPromptContainer: {
        width: "100%",
        padding: 15,
        marginBottom: 20,
        marginTop: "auto"
    },
    promptAndTimeSentContainer: {
        alignSelf: "flex-end",
        maxWidth: "80%",
        flexDirection: "row",
        alignItems: "flex-end",
    },

    chatPrompt: {
        backgroundColor: theme.colors.primaryBlue,
        borderRadius: 15,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexShrink: 1,
    },

    promptText: {
        color: "#fbfbfb",
        fontSize: 17,
        fontFamily: "sans-serif",
        flexShrink: 1,
        flexWrap: "wrap",
        flex: 1,
    },


    timeSentPrompt: {
        marginLeft: "auto",
        color: "#e1e1e1"
    },

    profileImg: {
        width: 40,
        height: 40,
        marginLeft: 5,
        marginTop: 5,
        borderRadius: 20
    },


    /*chat response */

    chatResponseContainer: {
        width: "90%",
        marginRight: "auto",
        padding: 20,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        marginBottom: 4
    },

    chatResponse: {
        fontFamily: "sans-serif",
        width: "100%",
        borderRadius: 15,
        backgroundColor: "#f1f1f1",
        color: "#4e4e4e",
        paddingVertical: 15,
        paddingHorizontal: 10,
        fontSize: 17
    },

    timeSentResponseContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
    },

    timeSentResponse: {
        marginTop: 2,
        marginLeft: "auto",
        color: "#4e4e4e"
    },

    /*bot profile picture */

    botProfile: {
        marginLeft: -10,
        width: 45,
        height: 45,
        borderRadius: 25,
        marginRight: 9,
        backgroundColor: "#fefefe",
        borderColor: "#cbcbcb",
        borderWidth: 1,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        overflow: "hidden"
    },

    botProfileImage: {
        color: "#b8e0fc",
        marginBottom: 2
    },

    botProfileImagee: {
        width: 60,
        height: 60
    },

    /* loader*/
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 15,
        justifyContent: 'flex-start',
        backgroundColor: "#fefefe",
    },

    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 40,
        marginLeft: 40,
        width: "100%",
    },
    dot: {
        height: 8,
        width: 8,
        marginRight: 8,
        borderRadius: 10,
        backgroundColor: '#b8e0fc',
    },

})

export default styles 