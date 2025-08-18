import { StyleSheet  } from "react-native";
import theme from "../../../../../assets/variables/Variables"

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
    height: 400,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: theme.colors.primaryBlue,
    borderBottomWidth: 3,
 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: theme.colors.primaryBlue,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    marginBottom: 5,
    color: theme.colors.primaryBlue,
  },
  errorMessage: {
    fontSize: 16,
    margin: 5,
    color: 'red',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderBottomColor: theme.colors.primaryBlue,
    borderBottomWidth: 2,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.mainBkgColor,
    marginBottom: 15,
  },
  button: {
    backgroundColor: theme.colors.mainBkgColor,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: theme.colors.primaryBlue,
    borderWidth: 1,
  },
  buttonText: {
    color: theme.colors.primaryBlue,
    fontSize: 16,
    fontWeight: 'bold',
  },

  containerFooter: {
    textAlign: 'center',
    color: theme.colors.footerFontColor,
    marginTop: 30,
    paddingTop: 12,
    fontSize: 16,
    borderTopWidth: 1,
    borderColor: theme.colors.footerBdColor,
    width: '100%',
  },
  footerLink: {
    color: theme.colors.primaryBlue,
    fontWeight: 'bold',
  },
});

export default styles
