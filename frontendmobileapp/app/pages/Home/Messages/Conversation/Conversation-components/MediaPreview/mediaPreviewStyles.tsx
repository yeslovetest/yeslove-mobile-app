import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
previewContainer: {
    position: "relative",
    alignSelf: "center",
    marginBottom: 6,
  },
  previewImage: {
    borderRadius: 14,
    backgroundColor: "#dbe3ef",
  },
  previewVideo: {
    borderRadius: 14,
    backgroundColor: "#0f172a",
  },
  moreChip: {
    alignSelf: "flex-end",
    marginBottom: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  moreChipSent: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.35)",
  },
  moreChipReceived: {
    backgroundColor: "#dfeaff",
    borderColor: "#c9dcff",
  },
  moreChipText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  moreChipTextSent: {
    color: "#f5f9ff",
  },
  moreChipTextReceived: {
    color: "#1f3b75",
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