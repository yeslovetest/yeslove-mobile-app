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
        paddingVertical: 9,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: "#7296ED",
        borderRadius: 8,
        alignItems: 'center',
        paddingLeft: 10,
        justifyContent: 'flex-start',
    },

    chatbotButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: "#fff"
    },

})

export default styles