import theme from "@/assets/variables/Variables";
import { vw } from "@/ts/viewport-units";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
      decorBox: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 50,
        width: "100%",
        top: 0, 
        borderBottomWidth: 3,
        borderBottomColor: theme.colors.primaryBlue,
        opacity: 0.7,
    },

    userPostBoxContainer: {
        marginTop: vw(5),
        width: theme.spacing.postWidth,
        borderRadius: 10,
        height: 265,
        backgroundColor: "#fff",
        justifyContent: "flex-start",
        alignItems: "center",
    },

    userPostBox: {
        padding: 10,
        width: "100%",
        height: 100,
        paddingHorizontal: 10,
        marginBottom: vw(5)
    },

    postInput: {
      minHeight: 90,
      maxHeight: 150,
      outlineColor: "#fff",
      padding: 7
    },

    postButton: {
       width: 80,
       height: 30,
       backgroundColor: theme.colors.primaryBlue,
       display: "flex",
       justifyContent: "center",
       alignItems: "center",
       paddingVertical: 20,
       borderRadius: 15,
       opacity: 0.95
    },

    postButtonText: {
      color: "#fff"
    },


    postIcons: {
        width: "80%",
        display: "flex",
        justifyContent: "space-around",
        flexDirection: "row",
        alignItems: "center",
        opacity: 0.8,
        marginBottom: 15
    },

})

export default styles 