import React from 'react';
import { Text, View } from 'react-native';
import styles from './MessageStyles';

interface Props {
    prompt: string;
    time: string;
}

export default function Message({ prompt, time }: Props) {

    return (
        <View style={styles.chatMessageContainer}>
            <View style={styles.messageAndTimeSentContainer}>
                <View style={styles.chatMessage}>
                    <Text numberOfLines={3} ellipsizeMode="tail" style={styles.messageText}>
                        {prompt}
                    </Text>
                    <Text style={styles.timeSentMessage}>{time}</Text>
                </View>
            </View>
        </View>
    );
}
