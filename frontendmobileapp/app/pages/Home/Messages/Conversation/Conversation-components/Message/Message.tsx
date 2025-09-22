import React from 'react';
import { Text, View } from 'react-native';
import styles from './MessageStyles';

interface Props {
    prompt: string;
    time: Date;
}

export default function Message({ prompt, time }: Props) {
    const hhmm = time
        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        .replace(/^0/, '');

    return (
        <View style={styles.chatMessageContainer}>
            <View style={styles.messageAndTimeSentContainer}>
                <View style={styles.chatMessage}>
                    <Text numberOfLines={3} ellipsizeMode="tail" style={styles.messageText}>
                        {prompt}
                    </Text>
                    <Text style={styles.timeSentMessage}>{hhmm}</Text>
                </View>
            </View>
        </View>
    );
}
