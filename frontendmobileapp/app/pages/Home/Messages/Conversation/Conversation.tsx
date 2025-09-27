import Header from '@/app/Universal-components/Header/Header';
import React, { useEffect, useCallback } from 'react';
import { View, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import ChatResponse from './Conversation-components/Chat-response/ChatResponse';
import Message from './Conversation-components/Message/Message';
import ConversationTextInput from './Conversation-components/Conversation-text-input/ConversationTextInput';
import styles from './ConversationStyles';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { sendChatMessage, markChatOpened, setChatMessages, fetchFriendList } from '@/app/store/Chat/chatSlice';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';

const Conversation = () => {

  const dispatch = useAppDispatch();
  const messages = useAppSelector(state => state.chat.messages ?? []);
  const userName = useAppSelector(state => state.user.name ?? "");
  const currentUserId = useAppSelector(state => state.user.id ?? "");
  const otherUserId = useAppSelector(
    (state) => state.navigation.tabStack.at(-1)?.data?.userId
  );

  useFocusEffect(
    useCallback(() => {

      return () => {
        // Runs when screen loses focus
        dispatch(setChatMessages([]));  
      };
    }, [])
  );
  
  
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Only run if there’s a last message and it hasn’t been opened by the current user
    if (lastMessage?.opened === false && lastMessage?.sender !== userName) {
      dispatch(markChatOpened(otherUserId ?? ''));
      dispatch(fetchFriendList(currentUserId ?? ''));  // Refresh friend list
    }

  // This effect will run once when messages become available
  }, [messages.length]); 

  
  const handleSend = (text: string) => {
    dispatch(sendChatMessage({id: otherUserId, message: text}));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={60}
    >
      <Header />
      <View style={styles.chatContainer}>
       
        <FlatList
          data={messages}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) =>
            item?.sender !== userName ? (
              <ChatResponse text={item?.content ?? ''} time={dayjs(item?.timestamp ?? '').format('MMM D, YYYY h:mm A')}/>
            ) : (
              <Message prompt={item?.content ?? ''} time={dayjs(item?.timestamp ?? '').format('MMM D, YYYY h:mm A')} />
            )
          }
          contentContainerStyle={styles.contentContainer}
        />
       
      <View style={{justifyContent: "center", width: "100%", alignItems: "center"}}>
        <ConversationTextInput onSend={handleSend} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Conversation;

