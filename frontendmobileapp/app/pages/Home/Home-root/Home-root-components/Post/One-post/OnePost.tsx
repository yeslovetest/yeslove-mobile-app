import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native';
import styles from './OnePostStyles';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Post as PostData } from '@/generated-api'; //This is suuuuper bad practice but the component has the same name 
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { openTabOnTopAction, TabType } from '@/app/store/Navigation/navigationSlice';
import dayjs from 'dayjs';
import { retrievePostReactions, postReactionToPost, setPostReactionTab, SendFollowUser } from '@/app/store/Home-store/feedSlice';


export interface Props {
    post: PostData,
    follow: string[],
}

const OnePost = (props: Props) => {
    const dispatch = useAppDispatch();
    
    const [expanded, setExpanded] = useState(false);
    const [reactionType, setReactionType] = useState(props.post.current_user_reaction ?? 'default');
    const [popUpState, setPopUpState] = useState('hidden'); 
    const [followMenu, setFollowMenu] = useState('hidden');
    const currentUserId = useAppSelector(state => state.user.id);
    

    const changeReaction= (reaction: string) => {
        // runs when a user selects a reaction from the pop up
        if (reaction === 'reverseReaction' && reactionType === 'default'){
            dispatch(postReactionToPost({postId: props.post.id ?? 0, reactionType: 'like'}));
            setReactionType('like'); 
        }
        else if (reaction === 'reverseReaction' && reactionType !== 'default'){
            dispatch(postReactionToPost({postId: props.post.id ?? 0, reactionType: reactionType}));
            setReactionType('default');
            
        }
        else if (reactionType !== reaction) {
            dispatch(postReactionToPost({postId: props.post.id ?? 0, reactionType: reaction}));
            setReactionType(reaction);
            setPopUpState('hidden')
          
        }
        else  {
            dispatch(postReactionToPost({postId: props.post.id ?? 0, reactionType: reactionType}));
            setReactionType('default');
            setPopUpState('hidden');
        }   
    }       


    const displayReactions = () => {
       setPopUpState('visible')
    };

    const CHAR_LIMIT = 200;
    const isLongText = (props.post.content?.length || 0) > CHAR_LIMIT

    const handleToggle = () => {
        setExpanded(!expanded);
    };

    const openProfile = () => {
        dispatch(openTabOnTopAction({type: TabType.PROFILE, data: {"userId": props.post.author_id}}))
    }
    
    const displayIndividualPost = (tab: string) => {
        dispatch(retrievePostReactions({postId: props.post.id ?? 0}));
        dispatch(openTabOnTopAction({ type: TabType.INDIVIDUAL_POST, data: props.post}));
        dispatch(setPostReactionTab(tab))   
    }


    const sendFollowReq = (action: string) => {
        // runs when a user clicks 'follow' or 'unfollow' from the pop up
        if (action === 'basic'){
            dispatch(SendFollowUser({keycloakId: props.post.author_id ?? '', 
                action: 'follow', type: 'basic'}));
            setFollowMenu('hidden'); 
        }
        else if (action === 'friend'){
            dispatch(SendFollowUser({keycloakId: props.post.author_id ?? '', 
                action: 'follow', type: 'friend'}));
            setFollowMenu('hidden');  
        }
        else if (action === 'unfollow') {
            dispatch(SendFollowUser({keycloakId: props.post.author_id ?? '', 
                action: 'unfollow', type: 'unfollow'}));
            setFollowMenu('hidden');
        }
    }

    return (
        <View style={styles.postContainer} >
            <View style={styles.postHeaderContent}>
                <View style={styles.profileImageContainer}>
                    <Image style={styles.profileImage} source={{ uri: props.post.author_pic }} />
                    <View style={styles.profileInfoContainer}>
                        <TouchableOpacity style={styles.profileName} onPress={openProfile}>
                            <Text>{props.post.author}</Text>
                        </TouchableOpacity>
                        <Text style={styles.timePosted}>{props.post.timestamp ? dayjs(props.post.timestamp).format('MMM D, YYYY h:mm A') : 'Unknown date'}</Text>
                    </View>
                </View>  
                {props.post.author_id !== currentUserId && (
                    <View style={styles.followUser}>
                        <TouchableOpacity onPress={() => setFollowMenu('visible')}>
                            <Text style={styles.followUserText}>{props?.follow? 'following' : 'follow'}</Text>
                        </TouchableOpacity>
                        <View style={{...styles.reactionPopUp, ...styles.followMenuPopUp, visibility: followMenu}}
                            onPointerLeave={() => setFollowMenu('hidden')}>
                            {(props?.follow === undefined) && 
                            (
                                <TouchableOpacity style={styles.followMenuOptions} onPress={() => sendFollowReq('basic')} >
                                    <Text style={styles.followMenuPopUpText}>follow</Text>
                                </TouchableOpacity>
                            )}
                            {(props?.follow?.[1] !== 'friend') && 
                            (
                                <TouchableOpacity style={styles.followMenuOptions} onPress={() => sendFollowReq('friend')} >
                                    <Text style={styles.followMenuPopUpText}>follow as a friend</Text>
                                </TouchableOpacity>
                            )}
                            {(props?.follow !== undefined) && 
                            (
                                <TouchableOpacity style={styles.followMenuOptions} onPress={() => sendFollowReq('unfollow')} >
                                    <Text style={styles.followMenuPopUpText}>unfollow</Text>
                                </TouchableOpacity>
                            )}  
                        </View>
                    </View>
                )}  
                
            </View>
            <Text style={styles.postContent}>
            {expanded || !isLongText ? props.post.content : `${props.post.content?.substring(0, CHAR_LIMIT)}...`}
            </Text>

            <View style={styles.seeLessAndLikeContainer} onPointerLeave={() => setPopUpState('hidden')}>
                <View style={{...styles.likeButtonContainer, backgroundColor: 'white'}} >
                    
                    <View style={{...styles.reactionPopUp, visibility: popUpState}}
                          onPointerLeave={() => setPopUpState('hidden')}>
                        <TouchableOpacity style={styles.likeIcon} onPress={() => changeReaction('like')} >
                            <Ionicons name="thumbs-up-sharp" size={24} color='blue' />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.likeIcon} onPress={() => changeReaction('love')} >
                            <AntDesign  name="heart" size={24} color="red" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.likeIcon} onPress={() => changeReaction('laugh')} >
                            <FontAwesome6   name="laugh" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    
                    <TouchableOpacity style={[styles.likeIcon, styles.reactionIcon]} onPress={() => changeReaction('reverseReaction')} onLongPress={displayReactions}>
                        {(reactionType === 'default') && 
                            (<Ionicons   name="thumbs-up-outline" size={24} color='black' />)
                        }
                        {reactionType === 'like' && 
                            (<Ionicons name="thumbs-up-sharp" size={24} color='blue' />)
                        }
                        {reactionType === 'love' && 
                            (<AntDesign  name="heart" size={24} color="red" />)
                        }
                        {reactionType === 'laugh' && 
                            (<FontAwesome6  name="laugh" size={24} color="black" />)
                        }
                          
                        
                    </TouchableOpacity>
                   <View  >
                        <Pressable style={{...styles.commentIcon, flexDirection: 'row'}} onPress={() => displayIndividualPost('reactions')}>
                            <Ionicons name="thumbs-up-outline" size={24} color="gray" />
                            <FontAwesome6  name="laugh" size={24} color="gray" />
                        </Pressable> 
                   </View> 
                    <Text>{props.post.likes}</Text>
                    <FontAwesome6 onPress={() => displayIndividualPost('comments')} style={styles.commentIcon} name="comment-dots" size={24} color="gray" />
                    <Text>{props.post.comments} </Text>
                </View>
                {isLongText && (
                    <TouchableOpacity onPress={handleToggle}>
                        <Text style={{ color: '#2c2e35ff', marginTop: 10 }}>
                            {expanded ? 'See Less' : 'See More'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

        </View>
    );
}

export default OnePost