import { View, Text, TouchableOpacity, Image, ScrollView, Modal, Pressable, Keyboard, Platform } from 'react-native';
import sharedStyles from '../HomeSharedStyles';
import styles from './CommentsAndReactionsStyles';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Video } from '@/app/Universal-components/Video/Video';
import { setPostReactionTab, postReactionToPost } from '@/app/store/Home-store/feedSlice';
import { openTabOnTopAction, TabType } from '@/app/store/Navigation/navigationSlice';
import dayjs from 'dayjs';
import PostComment from './Comments-and-reactions-components/Posted-comment/PostedComment';
import PostCommentField from './Comments-and-reactions-components/Post-comment-field/PostCommentField';
import PostReaction from '../Home-root/Home-root-components/Post/One-post/PostedReaction';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Header from '@/app/Universal-components/Header/Header';
import { BASE_URL } from '@/app/config/baseUrl';
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
    media_files?: Array<{ uri?: string; type?: string; name?: string; width?: number; height?: number }>;
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
    const [isReactionModalVisible, setReactionModalVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const resolveMediaUrl = (url?: string) => {
        if (!url) {
            return '';
        }

        if (/^https?:\/\//i.test(url)) {
            return url;
        }

        return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const postMedia: Array<{ uri: string; type: string; name?: string; width?: number; height?: number }> = (individualPost.media_files ?? [])
        .filter((item) => !!item?.uri && !!item?.type)
        .map((item) => ({
            uri: item.uri ?? '',
            type: item.type ?? 'image/jpeg',
            name: item.name,
            width: item.width,
            height: item.height,
        }));

    const showComment = () => {
        setContentDisplay('show');
    }

    useFocusEffect(React.useCallback(() => {
        const timer = setTimeout(() => {
            showComment();  // to allow the screen to load new updates
        }, 1000);
        return () => clearTimeout(timer);
    }, []));

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSubscription = Keyboard.addListener(showEvent, (event) => {
            setKeyboardHeight(event.endCoordinates?.height ?? 0);
        });

        const hideSubscription = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);



    const openProfile = () => {
        if (individualPost.author_id) {
            dispatch(openTabOnTopAction({ type: TabType.PROFILE, data: { "userId": individualPost.author_id } }))
        }
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
            setReactionModalVisible(false);

        }
        else {
            dispatch(postReactionToPost({ postId: individualPost.id ?? 0, reactionType: reactionType }));
            setReactionType('default');
            setReactionModalVisible(false);
        }
    }


    const displayReactions = () => {
        setReactionModalVisible(true);
    };

    return (
        <>
            <Header></Header>
            <View style={sharedStyles.container}>
                <View style={styles.keyboardContainer}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentInsetAdjustmentBehavior="automatic"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.contentContainer}
                    >
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
                        {postMedia.length > 0 && (
                            <View style={styles.postMediaWrapper}>
                                <PostFilePreview file={postMedia} showNextPreview />
                            </View>
                        )}
                        {individualPost.image &&  (
                            <Image style={styles.postImage} 
                                source={{ uri: resolveMediaUrl(individualPost.image) }}
                            /> 
                             
                        )}

                        {individualPost.video_url && (
                            <Video
                                source={{ uri: resolveMediaUrl(individualPost.video_url) }}
                                style={styles.postVideo}
                                useNativeControls
                                resizeMode={"contain" as any}
                            /> 
                        )}

                        <Text style={styles.postContent}>
                            {individualPost.content}
                        </Text>

                        <View style={{ ...styles.seeLessAndLikeContainer, borderTopWidth: 0 }}>
                            <View style={{ ...styles.likeButtonContainer, backgroundColor: 'white' }} >
                                <TouchableOpacity style={styles.reactionIcon} onPress={() => changeReaction('reverseReaction')} onLongPress={displayReactions}>
                                    {(reactionType === 'default') &&
                                        (<Ionicons name="thumbs-up-outline" size={24} color='black' />)
                                    }
                                    {reactionType === 'like' &&
                                        (<Ionicons name="thumbs-up-sharp" size={24} color='blue' />)
                                    }
                                    {reactionType === 'love' &&
                                        (<Ionicons name="heart" size={24} color="red" />)
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
                    <View style={[styles.commentComposerWrap, { marginBottom: keyboardHeight }]}>
                        <PostCommentField id={individualPost.id} pic={profilePic} />
                    </View>
                </View>

                <Modal
                    visible={isReactionModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setReactionModalVisible(false)}
                >
                    <Pressable style={styles.modalBackdrop} onPress={() => setReactionModalVisible(false)}>
                        <Pressable style={styles.reactionModalCard}>
                            <Text style={styles.modalTitle}>Choose reaction</Text>
                            <View style={styles.reactionModalActions}>
                                <TouchableOpacity style={styles.reactionAction} onPress={() => changeReaction('like')}>
                                    <Ionicons name="thumbs-up-sharp" size={28} color='blue' />
                                    <Text style={styles.reactionActionLabel}>Like</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.reactionAction} onPress={() => changeReaction('love')}>
                                    <Ionicons name="heart" size={28} color="red" />
                                    <Text style={styles.reactionActionLabel}>Love</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.reactionAction} onPress={() => changeReaction('laugh')}>
                                    <FontAwesome6 name="laugh" size={28} color="black" />
                                    <Text style={styles.reactionActionLabel}>Laugh</Text>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
            </View>
        </>
    );
};

export default IndividualPost;
