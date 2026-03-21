import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  compactContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  innerContainer: {
    width: "100%",
    maxWidth: 420,
    marginVertical: 12,
    backgroundColor: theme.colors.mainBkgColor,
    paddingHorizontal: 18,
    paddingVertical: 22,
    borderRadius: 18,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: theme.colors.primaryBlue,
    borderBottomWidth: 3,
    alignSelf: "center",
 },
  compactInnerContainer: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 14,
    marginVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 14,
    color: theme.colors.primaryBlue,
    letterSpacing: 0.5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  compactTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: theme.colors.primaryBlue,
  },
  compactLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  errorMessage: {
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 10,
    minHeight: 20,
    color: 'red',
    fontWeight: '600',
  },
  compactErrorMessage: {
    fontSize: 13,
    marginBottom: 8,
    minHeight: 18,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: theme.colors.mainBkgColor,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: theme.colors.primaryBlue,
    borderWidth: 1,
   
  },
  compactButton: {
    paddingVertical: 10,
    marginTop: 6,
  },
  buttonText: {
    color: theme.colors.primaryBlue,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  compactButtonText: {
    fontSize: 14,
  },
  buttonNext: {
    width: '100%',
    backgroundColor: theme.colors.mainBkgColor,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 14,
    marginBottom: 6,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: theme.colors.footerBdColor,
    borderWidth: 1,
  },
  compactButtonNext: {
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  greyText: {
    color: theme.colors.footerFontColor, 
    fontSize: 13,
    fontWeight: '400'
  },
  compactGreyText: {
    fontSize: 12,
  },
  containerFooter: {
    textAlign: 'center',
    color: theme.colors.footerFontColor,
    marginTop: 16,
    paddingTop: 10,
    fontSize: 14,
    lineHeight: 20,
    borderTopWidth: 1,
    borderColor: theme.colors.footerBdColor,
    width: '100%',
  },
  compactContainerFooter: {
    marginTop: 12,
    paddingTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  footerLink: {
    color: theme.colors.primaryBlue,
    fontWeight: 'bold',
  },
})

export default sharedStyles 