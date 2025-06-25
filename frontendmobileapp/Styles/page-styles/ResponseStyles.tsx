import { StyleSheet } from "react-native";
import theme from "../Variables"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  innerContainer: {
    width: theme.spacing.postWidth - 30,
  
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 15,
    display: "flex",
    alignItems: "center",
    borderBottomColor: theme.colors.primaryBlue,
    borderBottomWidth: 3,
 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 20,
    color: '#111',
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  label: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    marginBottom: 80,
    textAlign: 'center',
    color: '#111',
  },

  button: {
    backgroundColor: theme.colors.primaryBlue,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: theme.colors.primaryBlue,
    
  },
  buttonText: {
    color: theme.colors.mainBkgColor,
    fontSize: 16,
    fontWeight: 'bold',
  },

  backButton: {
    backgroundColor: theme.colors.mainBkgColor,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: theme.colors.primaryBlue,
  },

  backButtonText: {
    color: theme.colors.primaryBlue,
    fontSize: 16,
    fontWeight: 'bold',
  },

});

export default styles
