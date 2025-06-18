import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from '../../Styles/page-styles/HomeStyles';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import PostCommentField from './PostCommentField';
import { Post as PostData } from '@/generated-api'; //This is suuuuper bad practice but the component has the same name 
import { useAppDispatch } from '@/app/store/hooks';
import { openTabOnTopAction, TabType } from '@/app/store/navigationSlice';
import dayjs from 'dayjs';

export interface Props {
    post: PostData
}

const Post = (props: Props) => {
    const dispatch = useAppDispatch();
    const [expanded, setExpanded] = useState(false);
    const [commentSectionExpanded, setCommentSectionExpanded] = useState(false)

    const CHAR_LIMIT = 200;
    const isLongText = (props.post.content?.length || 0) > CHAR_LIMIT

    const handleToggle = () => {
        setExpanded(!expanded);
    };

    const handleCommentToggle = () => {
        setCommentSectionExpanded(!commentSectionExpanded)
    }

    const openProfile = () => {
        dispatch(openTabOnTopAction({type: TabType.PROFILE, data: {"userId": props.post.author_id}}))
    }

    return (
        <View style={styles.postContainer}>
            <View style={styles.profileImageContainer}>
                <Image style={styles.profileImage} source={{ uri: props.post.image }} />
                <View style={styles.profileInfoContainer}>
                    <TouchableOpacity style={styles.profileName} onPress={openProfile}>
                        <Text>{props.post.author}</Text>
                    </TouchableOpacity>
                    <Text style={styles.timePosted}>{props.post.timestamp ? dayjs(props.post.timestamp).format('MMM D, YYYY h:mm A') : 'Unknown date'}</Text>
                </View>
            </View>
            <Text style={styles.postContent}>
            {expanded || !isLongText ? props.post.content : `${props.post.content?.substring(0, CHAR_LIMIT)}...`}
            </Text>

            <View style={styles.seeLessAndLikeContainer}>
                <View style={styles.likeButtonContainer}>
                    <AntDesign style={styles.likeIcon} name="heart" size={24} color="red" />
                    <Text>{props.post.likes}</Text>
                    <FontAwesome6 onPress={handleCommentToggle} style={styles.commentIcon} name="comment-dots" size={24} color="gray" />
                    <Text>{props.post.comments}</Text>
                </View>
                {isLongText && (
                    <TouchableOpacity onPress={handleToggle}>
                        <Text style={{ color: '#2d5be3', marginTop: 10 }}>
                            {expanded ? 'See Less' : 'See More'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>


            {/* comment section */}
            {commentSectionExpanded && (
                <PostCommentField image={props.post.image}/>
            )}

        </View>
    );
};

export default Post;

