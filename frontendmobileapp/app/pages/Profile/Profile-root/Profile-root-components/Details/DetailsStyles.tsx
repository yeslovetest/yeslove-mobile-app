import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
   container: {
    width: "100%",
    justifyContent: "flex-start",
    marginTop: 12,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
   },
   detailsText: {
       marginBottom: 10,
       fontSize: 17,
       fontWeight: "700"
   },
   viewInformationText: {
    color: theme.colors.blackText,
    fontSize: 14,
    fontWeight: "500",
   },
   iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    paddingVertical: 2,
   },
   icon: {
    marginRight: 8,
    paddingTop: 0,
    color: theme.colors.blackText,
    fontSize: 20,
   },
   buttonContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
   },
   button: {
    backgroundColor: "#1d4ed8",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 12,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
   },
   buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
   }
})

export default styles