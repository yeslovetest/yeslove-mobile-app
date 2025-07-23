import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native';
import styles from '../../Styles/page-styles/HomeStyles';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Post as PostData } from '@/generated-api'; //This is suuuuper bad practice but the component has the same name 
import { useAppDispatch } from '@/app/store/hooks';
import { openTabOnTopAction, TabType } from '@/app/store/navigationSlice';
import dayjs from 'dayjs';
import { retrievePostReactions, postReactionToPost, setPostReactionTab } from '@/app/store/feedSlice';


export interface Props {
    post: PostData
}

const Post = (props: Props) => {
    const dispatch = useAppDispatch();
    
    const [expanded, setExpanded] = useState(false);
    const [reactionType, setReactionType] = useState(props.post.current_user_reaction ?? 'default');
    const [popUpState, setPopUpState] = useState('hidden'); 
    

    const changeReaction= (reaction: string) => {
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
            setPopUpState('hidden')
      
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

    return (
        <View style={styles.postContainer} >
            <View style={styles.profileImageContainer}>
                <Image style={styles.profileImage} source={{ uri: props.post.author_pic }} />
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
                        <Text style={{ color: '#2d5be3', marginTop: 10 }}>
                            {expanded ? 'See Less' : 'See More'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

        </View>
    );
}

export default Post