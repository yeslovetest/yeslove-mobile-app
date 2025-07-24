import { StyleSheet,  Dimensions  } from "react-native";
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
    height: Dimensions.get('window').height * 0.87,
    marginTop: 10,
    backgroundColor: theme.colors.mainBkgColor,
    padding: 15,
    borderRadius: 15,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: theme.colors.primaryBlue,
    borderBottomWidth: 3,
 },
  scrollContainer: {
    width: theme.spacing.postWidth - 30,
    backgroundColor: theme.colors.mainBkgColor,
    padding: 15,
    height: 50,
    
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
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
   buttonNext: {
    backgroundColor: theme.colors.mainBkgColor,
    paddingVertical: 8,
    width: '50%',
    borderRadius: 8,
    margin: 30,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: theme.colors.footerBdColor,
    borderWidth: 1,
  },
  greyText: {
    color: theme.colors.footerFontColor, 
    fontSize: 14,
    fontWeight: '400'
  },
  containerFooter: {
    textAlign: 'center',
    color: theme.colors.footerFontColor,
    marginTop: 20,
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

export default styles;
