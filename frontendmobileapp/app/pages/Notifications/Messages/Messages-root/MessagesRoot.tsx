import Header from '@/app/Universal-components/Header/Header'
import React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import messagesSharedStyles from '../MessagesSharedStyles'
import OneMessage from './Messages-root-components/One-message/OneMessage'
import PlaceholderMessages from './Messages-root-components/PlaceholderMessages'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { openTabOnTopAction, TabType } from '@/app/store/Navigation/navigationSlice'

const Messages = () => {
    const dispatch = useAppDispatch()
    const userId = useAppSelector(
        (state) => state.navigation.tabStack.at(-1)?.data?.userId
    );
    const userName = useAppSelector(
        (state) => state.profile.profiles[userId]?.username ?? ""
    );

    const openConversation = () => {
        dispatch(openTabOnTopAction({ type: TabType.CONVERSATION }))
    }


    return (
        <>
            <Header mainTitle="test-user"></Header>
            <ScrollView contentContainerStyle={messagesSharedStyles.contentContainer} style={messagesSharedStyles.container}>
                <TouchableOpacity onPress={openConversation}>
                    {PlaceholderMessages.map((MessagePlaceholder, index) => (
                        <OneMessage message={MessagePlaceholder} key={index} ></OneMessage>
                    ))}
                </TouchableOpacity>
            </ScrollView>
        </>
    )
}

export default Messages
