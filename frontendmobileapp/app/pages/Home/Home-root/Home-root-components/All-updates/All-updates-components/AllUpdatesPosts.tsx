import React from 'react';
import { View } from 'react-native';
import Post from '../../Post/One-post/OnePost';
import {  updatePostsForFeedAction } from '@/app/store/Home-store/feedSlice';
import { useFocusEffect } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';

const AllUpdatesPosts = () => {
const dispatch = useAppDispatch();
useFocusEffect(React.useCallback(() => {
    dispatch(updatePostsForFeedAction('all'));
    
  }, []));
  const posts = useAppSelector(state => state.feed.feed.posts)
  

    return (
        <View>
            {posts.map((post, index) => (
                <Post
                    key={index}
                    post={post}
                />
            ))}
        </View>
    );
};

export default AllUpdatesPosts;
