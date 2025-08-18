import { StyleSheet } from "react-native";
import theme from "../Variables"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: 'rgba(74, 90, 143, 0.1)',
    
  },

  header: {
    backgroundColor: theme.colors.mainBkgColor,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'absolute',
    left: 50,
    top: -55,
    zIndex: 1000,
    width: '100%'
  },
  profile: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileName: {
    fontSize: 20,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 60, 
    borderWidth: 1,
    borderColor: "#ccc",
  },
  chatBody: {
    padding: 30
  },
  messageTextBox: {
    width: '80%',
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: 'rgba(191, 206, 218, 1)',
    padding: 10,
    marginBottom: 20,
    
  },
   RightAlignedBox: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 12,
    backgroundColor: theme.colors.mainBkgColor
  },
  messageText: {
    fontSize: 16,
  },
  footerMessageBox: {
    position: 'absolute',  
    bottom: 5, 
    width: '100%',
    borderColor: 'grey', 
    backgroundColor: 'white',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerMessageTextInput: {
    width: '75%',
    padding:6,
    borderColor: theme.colors.mainBkgColor, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderBlockColor: 'grey',
    color: theme.colors.blackText, 
    fontSize: 16,
  },
  messageTime: {
    color: 'grey',
    fontSize: 12,
    marginTop: 10
  },
  sendMsgBtn: {
    borderColor: theme.colors.primaryBlue,
    borderWidth: 2,
    padding: 6,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  sendMsgBtnText: {
    color: theme.colors.primaryBlue,
    fontSize: 16,
    fontWeight: '500'
  },
  disabledBtn: {
    visibility: 'hidden'
  }
});

export default styles
