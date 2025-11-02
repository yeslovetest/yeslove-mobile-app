import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import sharedStyles from '../HomeSharedStyles';
import styles from './CommentsAndReactionsStyles';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { Video } from 'expo-av';
import { setPostReactionTab, postReactionToPost } from '@/app/store/Home-store/feedSlice';
import { openTabOnTopAction, TabType } from '@/app/store/Navigation/navigationSlice';
import dayjs from 'dayjs';
import PostComment from './Comments-and-reactions-components/Posted-comment/PostedComment';
import PostCommentField from './Comments-and-reactions-components/Post-comment-field/PostCommentField';
import PostReaction from '../Home-root/Home-root-components/Post/One-post/PostedReaction';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import Header from '@/app/Universal-components/Header/Header';
import { BASE_URL } from '@/app/index';
import PostFilePreview from '../Post-modal/Post-modal-components/File-preview/PostFilePreview';

export interface Post {
    id: number;
    author: string;
    author_id: string;
    author_pic: string;
    content: string;
    image: string;
    video_url: string;
    likes: number;
    comments: number;
    timestamp: string;
    current_user_reaction: string;
}

const IndividualPost = () => {

    const dispatch = useAppDispatch();
    const individualPost: Post = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as Post;

    const reactionTypeTab = useAppSelector(state => state.feed.postReactionTab);
    const userId = useAppSelector(state => state.user.id);
    const profilePic = useAppSelector(state => state.profile.profiles[Number(userId)]?.profile_pic ?? '');
    const comments = useAppSelector(state => state.feed.userPosts.comments);
    const reactions = useAppSelector(state => state.feed.userPosts.reactions);

    const [contentDisplay, setContentDisplay] = useState("hide");
    const [reactionType, setReactionType] = useState(individualPost.current_user_reaction ?? 'default');
    const [popUpState, setPopUpState] = useState('hidden');

    const showComment = () => {
        setContentDisplay('show');
    }

    useFocusEffect(React.useCallback(() => {
        const timer = setTimeout(() => {
            showComment();  // to allow the screen to load new updates
        }, 1000);
        return () => clearTimeout(timer);
    }, []));



    const openProfile = () => {
        dispatch(openTabOnTopAction({ type: TabType.PROFILE, data: { "userId": individualPost.author_id } }))
    }


    const changeReaction = (reaction: string) => {
        if (reaction === 'reverseReaction' && reactionType === 'default') {
            dispatch(postReactionToPost({ postId: individualPost.id ?? 0, reactionType: 'like' }));
            setReactionType('like');
        }
        else if (reaction === 'reverseReaction' && reactionType !== 'default') {
            dispatch(postReactionToPost({ postId: individualPost.id ?? 0, reactionType: reactionType }));
            setReactionType('default');

        }
        else if (reactionType !== reaction) {
            dispatch(postReactionToPost({ postId: individualPost.id ?? 0, reactionType: reaction }));
            setReactionType(reaction);
            setPopUpState('hidden')

        }
        else {
            dispatch(postReactionToPost({ postId: individualPost.id ?? 0, reactionType: reactionType }));
            setReactionType('default');
            setPopUpState('hidden')
        }
    }


    const displayReactions = () => {
        setPopUpState('visible')
    };

    return (
        <>
            <Header></Header>
            <View style={sharedStyles.container}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={[styles.postContainer, styles.indPostContainer]}>
                        <View style={styles.profileImageContainer}>
                            <Image style={styles.profileImage} source={{ uri: individualPost.author_pic }} />
                            <View style={styles.profileInfoContainer}>
                                <TouchableOpacity style={styles.profileName} onPress={openProfile}>
                                    <Text>{individualPost.author}</Text>
                                </TouchableOpacity>
                                <Text style={styles.timePosted}>{individualPost.timestamp ? dayjs(individualPost.timestamp).format('MMM D, YYYY h:mm A') : 'Unknown date'}</Text>
                            </View>
                        </View>
                        <Text style={styles.postContent}>
                            {individualPost.content}
                        </Text>
                        {individualPost.media_files && (
                            <PostFilePreview file={individualPost.media_files} />
                        )}
                        {individualPost.image &&  (
                            <Image style={styles.postImage} 
                                source={{ uri: `${BASE_URL}${individualPost.image.startsWith('/') ? '' : '/'}${individualPost.image}` }}
                            /> 
                             
                        )}

                        {individualPost.video_url && (
                            <Video
                                source={{ uri: `${BASE_URL}${individualPost.video_url.startsWith('/') ? '' : '/'}${individualPost.video_url}` }}
                                style={styles.postVideo}
                                useNativeControls
                                resizeMode={"contain" as any}
                            /> 
                        )}

                        <View style={{ ...styles.seeLessAndLikeContainer, borderTopWidth: 0 }} onPointerLeave={() => setPopUpState('hidden')}>
                            <View style={{ ...styles.likeButtonContainer, backgroundColor: 'white' }} >
                                <View style={{ ...styles.reactionPopUp, visibility: popUpState }}
                                    onPointerLeave={() => setPopUpState('hidden')}>
                                    <TouchableOpacity style={styles.likeIcon} onPress={() => changeReaction('like')} >
                                        <Ionicons name="thumbs-up-sharp" size={24} color='blue' />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.likeIcon} onPress={() => changeReaction('love')} >
                                        <AntDesign name="heart" size={24} color="red" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.likeIcon} onPress={() => changeReaction('laugh')} >
                                        <FontAwesome6 name="laugh" size={24} color="black" />
                                    </TouchableOpacity>
                                </View>


                                <TouchableOpacity style={[styles.likeIcon, styles.reactionIcon]} onPress={() => changeReaction('reverseReaction')} onLongPress={displayReactions}>
                                    {(reactionType === 'default') &&
                                        (<Ionicons name="thumbs-up-outline" size={24} color='black' />)
                                    }
                                    {reactionType === 'like' &&
                                        (<Ionicons name="thumbs-up-sharp" size={24} color='blue' />)
                                    }
                                    {reactionType === 'love' &&
                                        (<AntDesign name="heart" size={24} color="red" />)
                                    }
                                    {reactionType === 'laugh' &&
                                        (<FontAwesome6 name="laugh" size={24} color="black" />)
                                    }


                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>


                    <View style={[styles.homeNavBarContainer, styles.indPostNavBarContainer]}>
                        <View style={[styles.homeNavBar, styles.indPostNavBar]}>
                            <TouchableOpacity style={styles.homeItem} onPress={() => dispatch(setPostReactionTab('reactions'))}>
                                {reactionTypeTab === 'comments' && <Text style={styles.navText} >Reactions</Text>}
                                {reactionTypeTab === 'reactions' && <Text style={styles.activeHomeNavText} >Reactions</Text>}
                                {reactionTypeTab === 'reactions' && <View style={styles.activeIndicator}></View>}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.homeItem} onPress={() => dispatch(setPostReactionTab('comments'))}>
                                {reactionTypeTab === 'reactions' && <Text style={styles.navText} >Comments</Text>}
                                {reactionTypeTab === 'comments' && <Text style={styles.activeHomeNavText} >Comments</Text>}
                                {reactionTypeTab === 'comments' && <View style={styles.activeIndicator}
 />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {(reactionTypeTab === 'reactions' && contentDisplay === 'show') && (
                        <View>
                            {reactions.toReversed().map((reaction, index) => (
                                <PostReaction
                                    key={index}
                                    reaction={reaction}
                                />
                            ))}
                        </View>
                    )}

                    {(reactionTypeTab === 'comments' && contentDisplay === 'show') && (
                        <View>
                            {comments.toReversed().map((comment, index) => (
                                <PostComment
                                    key={index}
                                    comment={comment}
                                />
                            ))}
                        </View>
                    )}
                </ScrollView>
                <View>
                    <PostCommentField id={individualPost.id} pic={profilePic} />

                </View>
            </View>
        </>
    );
};

export default IndividualPost;
