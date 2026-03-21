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
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingBottom: 24,
  },

})

export default sharedStyles