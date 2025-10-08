import Header from '@/app/Universal-components/Header/Header'
import React, { useState } from 'react'
import { ScrollView, TouchableOpacity, Text, View } from 'react-native'
import messagesSharedStyles from '../MessagesSharedStyles'
import OneMessage from './Messages-root-components/One-message/OneMessage'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { openTabOnTopAction, TabType } from '@/app/store/Navigation/navigationSlice'
import AskChatbotButton from './Messages-root-components/Ask-chatbot-button/AskChatbotButton'
import { fetchChatMessages } from '@/app/store/Chat/chatSlice'

const Messages = () => {
    const dispatch = useAppDispatch()
    const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all')
    const userId = useAppSelector(
        (state) => state.navigation.tabStack.at(-1)?.data?.userId
    );
    const userName = useAppSelector(
        (state) => state.profile.profiles[userId]?.username ?? ""
    );

    const friendList = useAppSelector(state => state.chat.friends) || [];

    const openConversation = (otherUserId: string) => {
        dispatch(fetchChatMessages(otherUserId ?? ''));
        dispatch(openTabOnTopAction({ type: TabType.CONVERSATION, data: { userId: otherUserId } }));
    }
    // Apply filter to friendList
    const filteredFriendList = friendList.filter(friend => {
        if (filter === 'all') return true   
        if (filter === 'read') return friend.unread === false
        if (filter === 'unread') return friend.unread === true
        return true
    })

    
    return (
        <>
            <Header mainTitle={userName}></Header>
            <Text style={messagesSharedStyles.messagesText}>Messages</Text>
            <AskChatbotButton />
            <View style={messagesSharedStyles.filterBar}>
                <TouchableOpacity onPress={() => setFilter('all')}>
                    <View style={[
                        messagesSharedStyles.filterButton,
                        filter === 'all' ? messagesSharedStyles.filterButtonActive : messagesSharedStyles.filterButtonInactive
                    ]}>
                        <Text style={[
                            messagesSharedStyles.filterButtonText,
                            filter === 'all' ? messagesSharedStyles.filterButtonTextActive : messagesSharedStyles.filterButtonTextInactive
                        ]}>
                            All
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setFilter('read')}>
                    <View style={[
                        messagesSharedStyles.filterButton,
                        filter === 'read' ? messagesSharedStyles.filterButtonActive : messagesSharedStyles.filterButtonInactive
                    ]}>
                        <Text style={[
                            messagesSharedStyles.filterButtonText,
                            filter === 'read' ? messagesSharedStyles.filterButtonTextActive : messagesSharedStyles.filterButtonTextInactive
                        ]}>
                            Read
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setFilter('unread')}>
                    <View style={[
                        messagesSharedStyles.filterButton,
                        filter === 'unread' ? messagesSharedStyles.filterButtonActive : messagesSharedStyles.filterButtonInactive
                    ]}>
                        <Text style={[
                            messagesSharedStyles.filterButtonText,
                            filter === 'unread' ? messagesSharedStyles.filterButtonTextActive : messagesSharedStyles.filterButtonTextInactive
                        ]}>
                            Unread
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={messagesSharedStyles.contentContainer} style={messagesSharedStyles.container}>
                <View style={{width: '100%'}}>
                {filteredFriendList.map((friend, key) => (
                    <TouchableOpacity onPress={() => openConversation(friend.id ?? '')} key={friend.id ?? key}>
                        <OneMessage message={friend}  key={friend.id ?? key}></OneMessage>
                    </TouchableOpacity>)
                )}
                </View>
                

                
            </ScrollView>
        </>
    )
}

export default Messages
