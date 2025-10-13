import { StyleSheet } from "react-native"

const styles = StyleSheet.create({

    /* header */

    headerContainer: {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#fefefe",
        height: 60,
        borderBottomColor: "#fff",
        borderBottomWidth: 1,
    },
    headerBack: {
        color: "#010101",
        padding: 8,
        marginLeft: 3,
        borderRadius: 5,
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
        borderRadius: "50%",
        marginRight: 10,
        backgroundColor: "#fefefe",
        borderColor: "#cbcbcb",
        borderWidth: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },

    headerBotProfileImage: {
        color: "#b8e0fc",
        marginBottom: 2,
        fontSize: 20
    },

    chatbot: {
        fontWeight: 500,
        fontSize: 16
    },

    onlineNow: {
        fontSize: 11,
        color: "#1f1f1f"
    },

    onlineSymbol: {
        width: 7,
        height: 7,
        backgroundColor: "green",
        borderRadius: "50%",
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
        backgroundColor: "#e6edfd",
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
        color: "#fefefe"
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
        height: 40,
        paddingHorizontal: 3,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: "#fff",
        position: "absolute",
        bottom: 10,
        borderColor: "#c1c1c1",
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
        color: "#fafafa",
        backgroundColor: "#c9c9c9",
        borderRadius: "50%"
    },

    /*chat prompt */

    chatPromptContainer: {
        width: "100%",
        padding: 15,
        marginBottom: 4,
        marginTop: "auto"
    },
    promptAndTimeSentContainer: {
        marginLeft: "auto",
        maxWidth: "50%",
    },

    chatPrompt: {
        marginLeft: "auto",
        borderRadius: 15,
        backgroundColor: "#2d5be3",
        padding: 10
    },

    promptText: {
        color: "#f5f5f5",
        fontSize: 17,
        fontFamily: "sans-serif",
    },

    timeSentPrompt: {
        marginRight: "auto",
        color: "#4e4e4e"
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
        backgroundColor: "#fefefe",
        color: "#4e4e4e",
        padding: 10,
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
        borderRadius: "50%",
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