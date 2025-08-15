import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    commentContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 10,
      backgroundColor: "#fff",

    },

    postCommentContainer: {
      paddingHorizontal: 15,
      justifyContent: "center",
      flexDirection: "row",
      alignItems: "center",
    },

    commentBox: {
      width: "70%",
      height: 35,
      borderWidth: 2,
      borderColor: "#ccc",
      outlineColor: "#ccc",
      borderRadius: 15,
      paddingHorizontal: 3,
    },

    commentProfileImage: {
      width: 45,
      height: 45,
      borderRadius: 60, 
      borderWidth: 1,
      borderColor: "#ccc",
      marginRight: 10,
    },

    submitCommentButton: {
      width: 80,
      height: 35,
      backgroundColor: theme.colors.primaryBlue,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 15,
      opacity: 0.95,
      marginLeft: 10,
    },

    submitCommentButtonText: {
            color: "#f1f1f1"
    },
})

export default styles