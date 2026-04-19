import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
   container: {
    width: "100%",
    marginTop: 10,
   },
   gridContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
      justifyContent: "flex-start",
   },
   emptyStateContainer: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e8edf6",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
   },
   emptyStateText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
   },
    viewerContainer: {
      flex: 1,
      backgroundColor: "rgba(2, 6, 23, 0.97)",
      justifyContent: "center",
    },
    viewerClose: {
      position: "absolute",
      top: 52,
      right: 16,
      zIndex: 20,
      backgroundColor: "rgba(255,255,255,0.18)",
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 7,
   },
   viewerCloseText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
   },
   viewerItem: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
   },
   viewerImage: {
      width: "100%",
      height: "80%",
   },
   viewerVideo: {
      width: "100%",
      height: "80%",
   },
   viewerFooter: {
      position: "absolute",
      bottom: 24,
      alignSelf: "center",
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
   },
   viewerCount: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
   },
})

export default styles