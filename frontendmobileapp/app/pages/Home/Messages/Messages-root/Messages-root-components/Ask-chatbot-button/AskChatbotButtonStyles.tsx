import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
       width: "100%",
       justifyContent: "center",
       flexDirection: "row"
    },
    icon: {
        color: "#fff",
        marginRight: 8
    },
    chatbotButton: {
        width: "95%",
        flexDirection: "row",
        paddingVertical: 10,
        paddingRight: 12,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: "#7296ED",
        borderRadius: 8,
        alignItems: 'flex-start',
        paddingLeft: 10,
        justifyContent: 'flex-start',
    },

    chatbotButtonText: {
        flex: 1,
        flexShrink: 1,
        fontSize: 15,
        lineHeight: 21,
        fontWeight: '600',
        color: "#fff",
    },

})

export default styles