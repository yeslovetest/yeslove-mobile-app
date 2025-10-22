import { StyleSheet, Dimensions } from "react-native";


const styles = StyleSheet.create({
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
});


export default styles