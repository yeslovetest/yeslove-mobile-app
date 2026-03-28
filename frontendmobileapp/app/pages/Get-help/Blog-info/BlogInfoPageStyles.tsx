import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    screenContainer: {
      flex: 1,
      width: "100%",
      backgroundColor: "#f6f8fc",
      paddingHorizontal: 10,
      paddingTop: 8,
    },
    indBlogContainer: {
      flex: 1,
      width: "100%",
      backgroundColor: "#ffffff",
      borderRadius: 16,
    },
    contentContainer: {
      width: "100%",
      paddingBottom: 28,
    },
    progressContainer: {
      width: "100%",
      backgroundColor: "#ffffff",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 12,
      color: "#5f6b7c",
      fontWeight: "600",
      marginBottom: 6,
    },
    progressTrack: {
      width: "100%",
      height: 6,
      borderRadius: 6,
      backgroundColor: "#e7edf7",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#5b87f9",
      borderRadius: 6,
    },
})

export default styles