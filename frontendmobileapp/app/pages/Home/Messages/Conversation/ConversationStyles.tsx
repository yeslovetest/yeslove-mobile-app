import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
   
    
  },
  chatContainer: {
    flex: 1,
    width: '100%',
   
  },
  contentContainer: {
    flexGrow: 10,
    
    paddingVertical: 10,
  },
  mediaPreviewContainer: {
    display: 'flex', 
    position: 'absolute', 
    bottom: 50, 
    justifyContent: 'flex-end', 
    alignSelf: 'flex-end', 
    zIndex: 1000,
    paddingRight: 50, 
    marginTop: 20
  }
});

export default styles;
