import { StyleSheet, Dimensions } from "react-native";


const styles = StyleSheet.create({
  /*
  previewImage: {
     width: Dimensions.get('window').width * 0.3, 
     borderRadius: 10, 
     marginTop: 10,
     resizeMode: 'contain',
     aspectRatio: 1.5,
    },
  previewVideo: { 
    width: '100%', 
    height: Dimensions.get('window').height ,
    borderRadius: 10, 
    marginTop: 10,
    resizeMode: 'cover'
    
  },
  text: { marginTop: 10, fontSize: 16 },
*/
previewContainer: {
    position: "relative",
    marginRight: 8,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  previewVideo: {
    width: 100,
    height: 100,
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#000",
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeText: {
    color: "#fff",
    textAlign: "center",
  },
  previewHeader: {
    backgroundColor: 'white',
    zIndex: 10000,
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

fileName: {
  marginTop: 4,
  fontSize: 12,
  color: "#555",
  width: 90,
  textAlign: "center",
},


});



export default styles