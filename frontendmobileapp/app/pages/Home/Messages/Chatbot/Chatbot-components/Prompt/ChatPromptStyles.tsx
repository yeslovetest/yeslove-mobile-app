import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
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
        borderRadius: "50%"
    },

})

export default styles 