import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const sharedStyles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        paddingTop: 8,
        paddingHorizontal: 10,
        alignSelf: "center",
    },
    contentContainer: {
        width: "100%",
        paddingBottom: 24,
        alignItems: "center",
    },
})

export default sharedStyles