import { StyleSheet } from "react-native";
import theme from "@/assets/variables/Variables";

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 48,
    borderColor: '#ccc',
    borderBottomColor: theme.colors.primaryBlue,
    borderBottomWidth: 2,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.mainBkgColor,
    marginBottom: 12,
    fontSize: 15,
  },

});

export default styles;
