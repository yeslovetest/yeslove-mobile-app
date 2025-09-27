import { vw } from "@/ts/viewport-units";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    professionalProfileContainer: {
      marginTop: vw(5),
      width: 380,
      backgroundColor: "#fff",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      borderRadius: 15,
    },
  
    professionalProfileName: {
      marginBottom: 10,
      fontWeight: "600",
      fontSize: 18,
    },
  
    professionalDescription: {
      color: "#555",
      fontSize: 15,
    },
  
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 5,
      borderColor: "#fff",
      marginBottom: 10,
    },
    viewProfile: {
    backgroundColor: "#7296ED",
    width: 100,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10
   },
   buttonText: {
    color: "#ffffff",
    fontSize: 14,
   }
})

export default styles