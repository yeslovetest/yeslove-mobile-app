import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import styles from "../../Styles/page-styles/HomeStyles";
import { useAppSelector, useAppDispatch } from '../../app/store/hooks';
import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { setPostReactionTab } from '@/app/store/feedSlice';
import { openTabOnTopAction, TabType } from '@/app/store/navigationSlice';
import dayjs from 'dayjs';
import PostComment from './PostComment';
import PostCommentField from './PostCommentField';
import PostReaction from './PostReaction';
const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

export interface Post{
    id: number;
    author: string;
    author_id: string;
    author_pic: string;
    content: string;
    image: string;
    likes: number;
    comments: number;
    timestamp: string;
    current_user_reaction: string;
}

const IndividualPost = () => {
     const [ contentDisplay, setContentDisplay ] = useState("hide");
  
    const showComment = () => {
      setContentDisplay('show');
    }

   useFocusEffect(React.useCallback(() => {
       const timer = setTimeout(() => {
        showComment();  // to allow the screen to load new updates
      }, 1000);
      return () => clearTimeout(timer);
     }, []));
   
  
    
      

  const individualPost: Post = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as Post;

  
  const reactionTypeTab = useAppSelector(state => state.feed.postReactionTab);
  const userId = useAppSelector(state => state.user.id);
  const profilePic = useAppSelector(state => state.profile.profiles[Number(userId)]?.profile_pic ?? '');


  const dispatch = useAppDispatch();


  const comments = useAppSelector(state => state.feed.userPosts.comments);  
  const reactions = useAppSelector(state => state.feed.userPosts.reactions);
  
    
  const openProfile = () => {
          dispatch(openTabOnTopAction({type: TabType.PROFILE, data: {"userId": individualPost.author_id}}))
      }
      
  return (
      <View style={[styles.container, styles.containerIndPost]}>
        <ScrollView  contentContainerStyle={styles.contentContainer}>
          <View style={[styles.postContainer,  styles.indPostContainer]}>
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
          </View>
    
          <View style={[styles.homeNavBarContainer, styles.indPostNavBarContainer]}>
              <View style={[styles.homeNavBar, styles.indPostNavBar]}>
                  <TouchableOpacity style={styles.homeItem} onPress={() => dispatch(setPostReactionTab('reactions'))}>
                      <Text style={styles.navText}>Reactions </Text>
                      {reactionTypeTab === 'reactions' && <View style={styles.activeIndicator} />}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.homeItem} onPress={() => dispatch(setPostReactionTab('comments'))}>
                      <Text style={styles.navText}>Comments  </Text>
                      {reactionTypeTab === 'comments' && <View style={styles.activeIndicator} />}
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
        <View style={{position: 'absolute',  bottom: 0, width: '100%', borderTopWidth: 0,
           borderBottomWidth: 1, borderColor: 'grey', backgroundColor: 'white'}}>
            <PostCommentField id={individualPost.id} pic={profilePic}/>

        </View>
      </View>  
    );
};

export default IndividualPost;
