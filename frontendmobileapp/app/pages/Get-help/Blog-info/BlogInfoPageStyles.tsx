import theme from "@/assets/variables/Variables";
import { vw } from "@/ts/viewport-units";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
     indBlogContainer: {
       flex: 1,
       width: theme.spacing.postWidth,
       backgroundColor: "#fff",
       marginTop: vw(5),
       borderRadius: 15
   
     },
})

export default styles