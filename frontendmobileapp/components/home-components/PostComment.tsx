import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../../Styles/page-styles/HomeStyles';
import { Comment } from '@/generated-api';  
import dayjs from 'dayjs'; 

 interface Props {
    key: number;
    comment: Comment;
  }

const PostComment = (props: Props) => {

    return (
        <View style={[styles.postContainer, styles.indCommentContainer]}>
            <View style={styles.profileImageContainer}>
                
                <View style={styles.profileInfoContainer}>
                    <TouchableOpacity style={styles.profileName}>
                        <Text>{props.comment.author}</Text>
                    </TouchableOpacity>
                    <Text style={styles.timePosted}>{props.comment.timestamp ? dayjs(props.comment.timestamp).format('MMM D, YYYY h:mm A') : 'Unknown date'}</Text>
                </View>
            </View>
            
            <Text style={styles.postContent}>
                {props.comment.content }
            </Text>

        </View>
    );
};

export default PostComment;

