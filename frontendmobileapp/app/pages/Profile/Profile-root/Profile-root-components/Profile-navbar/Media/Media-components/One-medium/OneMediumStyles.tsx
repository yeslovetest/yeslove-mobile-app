import { StyleSheet, Dimensions } from "react-native"

const styles = StyleSheet.create({
  mediumContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: Dimensions.get('window').width * 0.3,   
    marginBottom: 2,
  },

  imageMedium: {
    borderRadius: 5,
    width: '100%', 
    marginTop: 2,
    resizeMode: 'cover',
    aspectRatio: 1.5,
  },
  videoMedium: { 
      width: '100%', 
      borderRadius: 5, 
      marginTop: 2,
      resizeMode: 'cover',
      aspectRatio: 1.5,
  },
})

export default styles
