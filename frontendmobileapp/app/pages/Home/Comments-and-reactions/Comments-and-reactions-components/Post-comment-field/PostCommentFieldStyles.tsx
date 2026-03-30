import theme from "@/assets/variables/Variables";
import { StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get('window').width;
const fontSize = Math.min(Math.max(SCREEN_WIDTH * 0.038, 14), 17);

const styles = StyleSheet.create({
    commentContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 10,
      paddingBottom: 12,
      paddingHorizontal: 12,
      backgroundColor: "#fff",
      borderTopWidth: 1,
      borderTopColor: "#E8EAF0",
      width: "100%",

    },

    postCommentContainer: {
      width: "100%",
      justifyContent: "flex-start",
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
    },

    commentBox: {
      flex: 1,
      minHeight: 46,
      maxHeight: 118,
      borderWidth: 1,
      borderColor: "#D7DBE6",
      outlineColor: "#ccc",
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize,
      lineHeight: Math.round(fontSize * 1.45),
      color: "#1f1f1f",
      backgroundColor: "#FBFCFF",
    },

    commentProfileImage: {
      width: 45,
      height: 45,
      borderRadius: 60, 
      borderWidth: 1,
      borderColor: "#ccc",
      marginBottom: 2,
    },

    submitCommentButton: {
      minWidth: 84,
      height: 42,
      backgroundColor: theme.colors.primaryBlue,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 12,
      opacity: 0.95,
      paddingHorizontal: 14,
      marginBottom: 2,
    },

    submitCommentButtonDisabled: {
      opacity: 0.55,
    },

    submitCommentButtonText: {
      color: "#f1f1f1",
      fontSize,
      fontWeight: '600',
    },
})

export default styles