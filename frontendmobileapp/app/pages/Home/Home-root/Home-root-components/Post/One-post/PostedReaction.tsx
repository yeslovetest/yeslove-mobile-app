import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from './OnePostStyles';
import { Reaction } from '@/generated-api';  

 interface Props {
    key: number;
    reaction: Reaction;
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
                <Image style={styles.profileImage} source={{ uri: props.reaction.picture }}/>    
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