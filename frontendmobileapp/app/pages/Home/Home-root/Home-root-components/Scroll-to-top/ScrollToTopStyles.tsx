import { StyleSheet } from "react-native";
import theme from "@/assets/variables/Variables";

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 90,
    right: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryBlue, 
    height: 48,
    width: 48,
    opacity: 0.7,
    borderRadius: 24, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, 
  },
  upIcon: {
    color: theme.colors.mainBkgColor, 
  }
});

export default styles;
