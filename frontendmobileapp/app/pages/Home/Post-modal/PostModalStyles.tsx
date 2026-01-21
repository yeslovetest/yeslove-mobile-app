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
    justifyContent: 'flex-end',
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
    width: "38%"
  },
  actionButtonsContainer: {
    flexDirection: 'row'
  },
  actionButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(241, 236, 236, 0.2)',
    marginLeft: 2,
    borderRadius: 5,

  },
  actionButtonsText : {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'grey',
    fontSize: 14
  }
  
});

export default styles;
