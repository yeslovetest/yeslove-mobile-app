import { vw } from "@/ts/viewport-units";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
       blogText: {
        paddingHorizontal: vw(5),
        paddingVertical: vw(5),
        textAlign: "justify",
        color: "#222"
    },
})

export default styles