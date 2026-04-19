import React from 'react';
import { Text, View } from 'react-native';
import styles from './MessageStyles';
import MediaFilePreview from '../MediaPreview/mediaPreview';
import { MediaFile } from '@/generated-api';

interface Props {
    prompt: string;
    time: string;
    media: { uri: string, type: string, name?: string }[] | MediaFile[];
}

export default function Message({ prompt, time, media }: Props) {
    const messageText = (prompt ?? '').trim();

    return (
        <View style={styles.chatMessageContainer}>
            <View style={styles.messageAndTimeSentContainer}>
                <View style={styles.chatMessage}>
                    <View style={styles.tailSent} />
                    <MediaFilePreview file={media} bubbleTone="sent" />
                    {messageText.length > 0 && (
                        <Text style={styles.messageText}>
                            {messageText}
                        </Text>
                    )}
                    <Text style={styles.timeSentMessage}>{time}</Text>
                </View>
            </View>
        </View>
    );
}
