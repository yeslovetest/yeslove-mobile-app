import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  userPostBoxContainer: {
    flex: 1,
    padding: 16,
  },
  postInput: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: "top", 
    borderRadius: 8,
    marginBottom: 16,
    outlineColor: "#fff",
  },
  postIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
})

export default styles