import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    padding: 10,
  },
  exitHeader: {
    width: "100%",
    paddingHorizontal: 5,
    height: 50,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
     borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  closeIcon: {
    position: "absolute",
    left: 0,
  },
  createPost: {
    color: theme.colors.primaryBlue,
    fontSize: 18,
    fontWeight: "600",
    width: "51%"
  },
  
});

export default styles;
