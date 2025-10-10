import React from 'react';
import { View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchFollowedUsers, updatePostsForFeedAction } from '@/app/store/Home-store/feedSlice';
import OnePost from '../../Post/One-post/OnePost';


const FriendsPosts = () => {
  const dispatch = useAppDispatch();
  useFocusEffect(React.useCallback(() => {
    dispatch(updatePostsForFeedAction({feedType: 'friends'}));
    dispatch(fetchFollowedUsers());
  }, []));
  
  const posts = useAppSelector(state => state.feed.feed.friends)
  const followedUsers = useAppSelector(state => state.feed.followedUsers)
  
    return (
        <View>
            {posts.map((post, index) => (
              
                <OnePost
                    key={index}
                    post={post}
                    follow={followedUsers[post?.author ?? '']}
                />
            ))}
        </View>
    );
}

export default FriendsPosts
