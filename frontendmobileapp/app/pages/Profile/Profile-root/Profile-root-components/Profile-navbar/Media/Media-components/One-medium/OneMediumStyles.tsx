import { StyleSheet, Dimensions } from "react-native"

const styles = StyleSheet.create({
  mediumContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: "30%",    
    aspectRatio: 1,   
    marginBottom: 8,
  },

  imageMedium: {
    borderRadius: 10,
    width: Dimensions.get('window').width * 0.3, 
    marginTop: 10,
    resizeMode: 'contain',
    aspectRatio: 1.5,
  },
  videoMedium: { 
      width: Dimensions.get('window').width * 0.3, 
      height: Dimensions.get('window').height * 0.5,
      borderRadius: 10, 
      marginTop: 10,
      resizeMode: 'contain'
  },
})

export default styles
