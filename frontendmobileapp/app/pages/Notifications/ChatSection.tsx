import { View, Text, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import styles from "./ChatSectionStyles";
import React, { useState } from 'react';
import { Friend } from './MessageInbox';
import dayjs from 'dayjs';
import { sendChatMessage } from '@/app/store/Chat/chatSlice';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

const ChatSection = () => {

  const dispatch = useAppDispatch();
  const userFriend: Friend = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as Friend;
  const chatMessages = useAppSelector(state => state.chat.messages ?? []);
  const [currentUserMsg, setCurrentUserMsg] = useState('');

  const sendChat = () => {
    dispatch(sendChatMessage({id: userFriend.userId, message: currentUserMsg}));
    setCurrentUserMsg('');
  }

  return (
      <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity style={styles.profile}>
                <Image style={styles.profileImage} source={{ uri: userFriend.profilePic }}/>
                <Text style={styles.profileName}>{userFriend.username}</Text>
            </TouchableOpacity> 
        </View>
        <ScrollView style={styles.chatBody}>
          {chatMessages.map((message, index) => 
            <View style={[styles.messageTextBox, 
             message?.sender !== userFriend.username? 
             styles.RightAlignedBox : []]} key={index}>
              <Text style={styles.messageText}>{message?.message}</Text>
              <Text style={styles.messageTime}>{dayjs(message?.timestamp).format('MMM D, YYYY h:mm A')}</Text>
            </View>
          )}  
        </ScrollView>  
        <View style={styles.footerMessageBox}>
            <TextInput
              placeholder='Enter Message'
              style={styles.footerMessageTextInput}
              value={currentUserMsg}
              onChangeText={(val) => setCurrentUserMsg(val)}
            />
            <TouchableOpacity style={[styles.sendMsgBtn, 
              currentUserMsg === ''? [styles.disabledBtn] : []]} onPress={sendChat} disabled={currentUserMsg === ''}>
              <Text style={styles.sendMsgBtnText}>send</Text>
            </TouchableOpacity>
         </View>
       </View>    
    );
};

export default ChatSection;

