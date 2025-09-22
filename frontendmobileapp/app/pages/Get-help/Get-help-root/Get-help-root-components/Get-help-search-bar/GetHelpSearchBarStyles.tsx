import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
      searchBarContainer: {
        width: theme.spacing.postWidth,
        borderRadius: 15,
        padding: 15,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
      },
    
      searchBar: {
        width: "100%",
        height: 43,
        borderWidth: 1,
        borderColor: "#ddd",
        paddingHorizontal: 10,
      },
})

export default styles