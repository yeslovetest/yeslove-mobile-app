import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  userPostBoxContainer: {
    flex: 1,
    borderWidth: 1,
    height: 200,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  postInput: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: "top",
    borderRadius: 8,
    height: 300,
    width: "100%",
    marginBottom: 16,
    height: "100%",
    padding: 5,

  },
  postIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
})

export default styles