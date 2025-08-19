import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const sharedStyles = StyleSheet.create({
       container: {
        flex: 1,
        width: theme.spacing.standardPageContentWidth,
    },
    contentContainer: {
        width: "100%",
    },
})

export default sharedStyles