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
    onlineNowRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
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
        justifyContent: "flex-start",
        position: "relative",
        backgroundColor: "#eef3f8",
    },


    contentContainer: {
        flexGrow: 1,
        backgroundColor: "#eef3f8",
        paddingHorizontal: 12,
        paddingTop: 14,
        paddingBottom: 20,
    },
    backgroundContainer: {
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
    },
    background: {
        minHeight: "100%",
        width: "100%",
        backgroundColor: "#eef3f8",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    container: {
        flex: 1,
        width: "100%",
    },
    chatBody: {
        flex: 1,
        width: "100%",
        backgroundColor: "#eef3f8",
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
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        maxWidth: 620,
        minHeight: 50,
        paddingHorizontal: 8,
        paddingVertical: 7,
        borderRadius: 18,
        backgroundColor: "#fff",
        borderColor: "#d5d9de",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    textInput: {
        flex: 1,
        minHeight: 34,
        maxHeight: 96,
        fontSize: 15,
        lineHeight: 20,
        color: "#1b2430",
        paddingHorizontal: 10,
        paddingTop: 6,
        paddingBottom: 6,
        textAlignVertical: "center",
        includeFontPadding: false,
    },

    sendIcon: {
        padding: 8,
        color: "#fbfbfb",
        backgroundColor: theme.colors.primaryBlue,
        borderRadius: 20,
    },
    chatInputDock: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 12,
        backgroundColor: "#f8fafc",
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
    },

    /*chat prompt */

    chatPromptContainer: {
        width: "100%",
        paddingHorizontal: 8,
        marginBottom: 12,
        marginTop: "auto",
    },
    promptAndTimeSentContainer: {
        alignSelf: "flex-end",
        maxWidth: "86%",
        flexDirection: "row",
        alignItems: "flex-end",
    },

    chatPrompt: {
        backgroundColor: theme.colors.primaryBlue,
        borderRadius: 20,
        borderBottomRightRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexShrink: 1,
    },

    promptText: {
        color: "#fbfbfb",
        fontSize: 16,
        fontFamily: "sans-serif",
        flexShrink: 1,
        flexWrap: "wrap",
        flex: 1,
        lineHeight: 22,
    },


    timeSentPrompt: {
        marginTop: 6,
        alignSelf: "flex-end",
        color: "#dbe7f3",
        fontSize: 11,
    },

    profileImg: {
        width: 34,
        height: 34,
        marginLeft: 6,
        marginBottom: 2,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: "#d1d5db",
    },


    /*chat response */

    chatResponseContainer: {
        width: "100%",
        paddingHorizontal: 8,
        marginBottom: 12,
        alignItems: "flex-start",
    },

    chatResponse: {
        fontFamily: "sans-serif",
        width: "100%",
        maxWidth: "92%",
        borderRadius: 20,
        borderBottomLeftRadius: 8,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        color: "#334155",
        paddingVertical: 14,
        paddingHorizontal: 14,
        fontSize: 16,
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },

    timeSentResponseContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
    },

    timeSentResponse: {
        marginTop: 6,
        marginLeft: 6,
        color: "#64748b",
        fontSize: 11,
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
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderBottomLeftRadius: 8,
        justifyContent: 'flex-start',
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },

    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 8,
        paddingHorizontal: 8,
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