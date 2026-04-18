import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
previewContainer: {
    position: "relative",
    marginRight: 6,
    marginBottom: 6,
  },
  previewImage: {
    width: 84,
    height: 84,
    borderRadius: 10,
  },
  previewVideo: {
    width: 84,
    height: 84,
    borderRadius: 10,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  overlayText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  text: {
    textAlign: "center",
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#3f7cff",
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeText: {
    color: "#fff",
    textAlign: "center",
  },
  deleteWrapper: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  deleteIcon: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 14,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
  },
  fullScreenClose: {
    position: "absolute",
    top: 48,
    right: 18,
    zIndex: 20,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  fullScreenCloseText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  fullScreenItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
  },
  fullScreenVideo: {
    width: "100%",
    height: "80%",
  },
  fullScreenFooter: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  fullScreenCounter: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

});



export default styles