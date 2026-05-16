import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from './OnePostStyles';
import { ReactionResponse } from '@/generated-api';  
import { getImageSource } from '@/constants/imageFallbacks';

 interface Props {
    key: number;
    reaction: ReactionResponse;
  }

const PostReaction = (props: Props) => {

    const emoji = [
        ['like', '👍'],
        ['love', '❤️'],
        ['laugh', '😀'],
    ]

    const matchedEmoji = emoji.find(a => a[0] === props.reaction.type );

    return (
        <View style={[styles.postContainer, styles.indCommentContainer]}>
            <View style={styles.profileImageContainer}>
                <Image style={styles.profileImage} source={getImageSource(props.reaction.picture, 'profile')}/>    
                <View style={styles.profileInfoContainer}>
                    <TouchableOpacity style={styles.profileName}>
                        <Text>{props.reaction.author}</Text>
                    </TouchableOpacity>
                   
                    <Text style={styles.emoji}>{matchedEmoji? matchedEmoji[1] : '?'} </Text>
                           
                </View>
            </View>

        </View>
    );
};

export default PostReaction;
