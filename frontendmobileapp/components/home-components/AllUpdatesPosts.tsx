import React from 'react';
import { View } from 'react-native';
import Post from './Post';
import {  fetchFollowedUsers, updatePostsForFeedAction } from '@/app/store/feedSlice';
import { useFocusEffect } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';

const AllUpdatesPosts = () => {
const dispatch = useAppDispatch();
useFocusEffect(React.useCallback(() => {
    dispatch(updatePostsForFeedAction('all'));
    dispatch(fetchFollowedUsers());
  }, []));
  
  const posts = useAppSelector(state => state.feed.feed.posts)
  const followedUsers = useAppSelector(state => state.feed.followedUsers)
  

    return (
        <View>
            {posts.map((post, index) => (
              
                <Post
                    key={index}
                    post={post}
                    follow={followedUsers[post?.author ?? '']}
                />
            ))}
        </View>
    );
};

export default AllUpdatesPosts;
