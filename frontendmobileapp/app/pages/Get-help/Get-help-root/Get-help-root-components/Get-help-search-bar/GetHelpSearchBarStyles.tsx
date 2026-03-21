import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  searchBarContainer: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
  },
    
  searchBar: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    minWidth: 0,
  },

  searchButton: {
    backgroundColor: theme.colors.primaryBlue,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchButtonText: {
    color: "#fff",
    fontWeight: '600',
  }
})

export default styles