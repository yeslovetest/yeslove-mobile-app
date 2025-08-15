import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    width: theme.spacing.standardPageContentWidth
  },
  contentContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
})

export default sharedStyles