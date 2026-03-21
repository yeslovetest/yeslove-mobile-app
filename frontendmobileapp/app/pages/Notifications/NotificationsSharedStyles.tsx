import { StyleSheet } from "react-native";
import theme from "../../../assets/variables/Variables";

const sharedStyles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        paddingTop: 8,
        paddingHorizontal: 10,
    },
    contentContainer: {
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        paddingBottom: 24,
    },

})

export default sharedStyles