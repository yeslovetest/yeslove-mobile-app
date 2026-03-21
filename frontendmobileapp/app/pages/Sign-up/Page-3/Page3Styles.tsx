import { StyleSheet } from "react-native";
import theme from "@/assets/variables/Variables";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  innerContainer: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 18,
    alignItems: "center",
    borderBottomColor: theme.colors.primaryBlue,
    borderBottomWidth: 3,
    alignSelf: "center",
 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 2,
    marginBottom: 14,
    color: theme.colors.blackText,
    textAlign: 'center',
    letterSpacing: 0.4,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  label: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
    textAlign: 'center',
    color: theme.colors.blackText,
  },

  baseButton: {
    width: '100%',
    backgroundColor: theme.colors.primaryBlue,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: theme.colors.primaryBlue,
    
  },
  baseButtonText: {
    color: theme.colors.mainBkgColor,
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  disabledButton: {
    opacity: 0.65,
  },

  retryIndicatorRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  retryIndicatorText: {
    color: theme.colors.primaryBlue,
    fontSize: 14,
    fontWeight: '600',
  },

  backButton: {
    backgroundColor: theme.colors.mainBkgColor,
  },

  backButtonText: {
    color: theme.colors.primaryBlue,
  },

});

export default styles
