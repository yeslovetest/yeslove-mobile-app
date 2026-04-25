import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  editItemContainer: {
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e9f2",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  editItemText: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 8,
    color: "#6f7b91",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  editItemInfo: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d8deea",
    backgroundColor: "#fbfcff",
    width: "100%",
    minHeight: 46,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "500",
  },

  editItemInfoMultiline: {
    minHeight: 92,
    textAlignVertical: "top",
  },
})

export default styles 