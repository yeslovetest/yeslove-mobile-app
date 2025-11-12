import React from 'react';
import { Text, View } from 'react-native';
import styles from './MessageStyles';
import MediaFilePreview from '../MediaPreview/mediaPreview';

interface Props {
    prompt: string;
    time: string;
    media: { uri?: string, type?: string, media_url?: string, name?: string }[];
}

export default function Message({ prompt, time, media }: Props) {

    return (
        <View style={styles.chatMessageContainer}>
            <View style={styles.messageAndTimeSentContainer}>
                <View style={styles.chatMessage}>
                    <MediaFilePreview file={media}/>
                    <Text numberOfLines={3} ellipsizeMode="tail" style={styles.messageText}>
                        {prompt}
                    </Text>
                    <Text style={styles.timeSentMessage}>{time}</Text>
                </View>
            </View>
        </View>
    );
}
