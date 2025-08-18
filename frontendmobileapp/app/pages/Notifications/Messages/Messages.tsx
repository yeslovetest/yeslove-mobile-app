import Header from '@/app/Universal-components/Header/Header'
import React from 'react'
import { ScrollView } from 'react-native'
import messagesSharedStyles from './MessagesSharedStyles'
import OneMessage from './Messages-components/OneMessage'
import PlaceholderMessages from './Messages-components/PlaceholderMessages'

const Messages = () => {
    return (
        <>
            <Header></Header>
            <ScrollView contentContainerStyle={messagesSharedStyles.contentContainer} style={messagesSharedStyles.container}>
                {PlaceholderMessages.map((MessagePlaceholder, index) => (
                    <OneMessage message={MessagePlaceholder} key={index} ></OneMessage>
                ))}
        
            </ScrollView>
        </>
    )
}

export default Messages
