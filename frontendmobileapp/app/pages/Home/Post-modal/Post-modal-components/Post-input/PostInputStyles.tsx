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
    justifyContent: "flex-start",
    paddingHorizontal: 4,
    paddingVertical: 8,
    gap: 14,
  },
  mediaActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7fb",
  },
})

export default styles