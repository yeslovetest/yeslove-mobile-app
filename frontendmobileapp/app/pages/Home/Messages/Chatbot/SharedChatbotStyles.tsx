import theme from "@/assets/variables/Variables"
import { StyleSheet } from "react-native"

const styles = StyleSheet.create({
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

    container: {
        flex: 1,
        width: "100%",
    },


})

export default styles 