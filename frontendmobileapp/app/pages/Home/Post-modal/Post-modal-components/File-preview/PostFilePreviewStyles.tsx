import { StyleSheet, Dimensions } from "react-native";


const styles = StyleSheet.create({
  previewImage: {
     width: Dimensions.get('window').width * 0.3, 
     borderRadius: 10, 
     marginTop: 10,
     resizeMode: 'contain',
     aspectRatio: 1.5,
    },
  previewVideo: { width: 200, height: 150, borderRadius: 10, marginTop: 10 },
  text: { marginTop: 10, fontSize: 16 },
});


export default styles