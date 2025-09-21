import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
   container: {
    width: "100%",
    justifyContent: "flex-start",
    marginTop: 10
   },
   detailsText: {
       marginBottom: 8,
       fontSize: 19,
       fontWeight: "700"
   },
   viewInformationText: {
    color: theme.colors.blackText,
    fontSize: 17
   },
   iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
   },
   icon: {
    marginRight: 5,
    paddingTop: 4,
    color: theme.colors.blackText,
    fontSize: 23
   },
   buttonContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
   },
   button: {
    backgroundColor: "#7296ED",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10
   },
   buttonText: {
    color: "#ffffff",
    fontSize: 16,
   }
})

export default styles