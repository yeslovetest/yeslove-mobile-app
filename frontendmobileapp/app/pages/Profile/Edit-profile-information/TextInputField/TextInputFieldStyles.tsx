import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  editItemContainer: {
  backgroundColor: "#fff",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  paddingHorizontal: 30,
  paddingVertical: 15,
  marginBottom: 20,
  width: theme.spacing.postWidth
},

editItemText: {
  fontSize: 20,
  fontWeight: 600,
  marginBottom: 10,
  color: "#000",
},

editItemInfo: {
  borderWidth: 2,
  borderStyle: "solid",
  borderColor: theme.colors.viewEditBorderColor,
  width: "90%",
  paddingVertical: 5,
  paddingLeft: 10
},
})

export default styles 