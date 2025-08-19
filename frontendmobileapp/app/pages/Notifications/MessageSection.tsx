import React, { useState } from 'react'
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '@/app/store/hooks';
import MessageInbox from './MessageInbox';
import styles from './MessageSectionStyles';

const MessageSection = () => { 

  const items = ["Inbox"];
  const [activeTab, setActiveTab] = useState('Inbox');
  const [listOfFreinds, setListOfFreinds] =useState([{username:'', userId: '', profilePic: ''}]);
  const friends = useAppSelector(state => state.feed.followedUsers) || {}; 

  useFocusEffect(
    React.useCallback(() => {
        const friendList = Object.entries(friends)
        .filter(([username, [userId, followType, profilePic]]) => followType === 'friend')
        .map(([username, [userId, profilePic]]) => ({
            username,
            userId,
            profilePic,
        }));

        setListOfFreinds(friendList);
    }, [friends])
  );

  
  return (
    <View style={styles.aboutNavBarContainer}>

      {/**Messages (Inbox) */}
      {activeTab === "Inbox" && (
        listOfFreinds.map((friend, key) => 
            <MessageInbox 
                friend = {friend}
                key = {key}
            />
        )
      )}
    </View>  
  )
}

export default MessageSection;