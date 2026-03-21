import { StyleSheet  } from "react-native";
import theme from "../../../../assets/variables/Variables"

const styles = StyleSheet.create({
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
    backgroundColor: "#fff",
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
  modeToggleContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  compactModeToggleContainer: {
    marginBottom: 10,
  },
  modeToggleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cfd8dc',
    borderRadius: 8,
    backgroundColor: '#f7f9fc',
    paddingVertical: 8,
    alignItems: 'center',
  },
  modeToggleButtonActive: {
    borderColor: theme.colors.primaryBlue,
    backgroundColor: '#e8f1ff',
  },
  modeToggleText: {
    color: '#607d8b',
    fontSize: 14,
    fontWeight: '600',
  },
  modeToggleTextActive: {
    color: theme.colors.primaryBlue,
  },
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
  },
  compactInput: {
    height: 44,
    marginBottom: 10,
  },
  helperText: {
    alignSelf: 'flex-start',
    color: theme.colors.footerFontColor,
    fontSize: 12,
    lineHeight: 17,
    marginTop: -4,
    marginBottom: 10,
  },
  compactHelperText: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  helperText: {
    alignSelf: 'flex-start',
    color: theme.colors.footerFontColor,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
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
  },
  compactButtonText: {
    fontSize: 14,
  },

  containerFooter: {
    textAlign: 'center',
    color: theme.colors.footerFontColor,
    marginTop: 18,
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
});

export default styles
