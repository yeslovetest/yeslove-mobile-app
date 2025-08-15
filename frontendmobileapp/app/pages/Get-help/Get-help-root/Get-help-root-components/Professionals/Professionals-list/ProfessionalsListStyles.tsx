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
})

export default styles