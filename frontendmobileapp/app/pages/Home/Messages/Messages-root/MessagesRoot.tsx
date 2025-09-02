import Header from '@/app/Universal-components/Header/Header'
import React, { useState } from 'react'
import { ScrollView, TouchableOpacity, Text, View } from 'react-native'
import messagesSharedStyles from '../MessagesSharedStyles'
import OneMessage from './Messages-root-components/One-message/OneMessage'
import PlaceholderMessages from './Messages-root-components/PlaceholderMessages'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { openTabOnTopAction, TabType } from '@/app/store/Navigation/navigationSlice'

const Messages = () => {
    const dispatch = useAppDispatch()
    const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all')
    const userId = useAppSelector(
        (state) => state.navigation.tabStack.at(-1)?.data?.userId
    );
    const userName = useAppSelector(
        (state) => state.profile.profiles[userId]?.username ?? ""
    );

    const openConversation = () => {
        dispatch(openTabOnTopAction({ type: TabType.CONVERSATION }))
    }

    const filteredMessages = PlaceholderMessages.filter(msg => {
        if (filter === 'all') return true
        if (filter === 'read') return msg.opened === true
        if (filter === 'unread') return msg.opened === false
        return true
    })


    return (
        <>
            <Header mainTitle="test-user"></Header>
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
                <TouchableOpacity onPress={openConversation}>
                    {filteredMessages.map((MessagePlaceholder, index) => (
                        <OneMessage message={MessagePlaceholder} key={index} ></OneMessage>
                    ))}
                </TouchableOpacity>
            </ScrollView>
        </>
    )
}

export default Messages
