import { StyleSheet } from "react-native";
import theme from "@/assets/variables/Variables";

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
    alignItems: "center",
    borderBottomColor: theme.colors.primaryBlue,
    borderBottomWidth: 3,
 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 20,
    color: theme.colors.blackText,
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
    color: theme.colors.blackText,
  },

  baseButton: {
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
  baseButtonText: {
    color: theme.colors.mainBkgColor,
    fontSize: 16,
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
