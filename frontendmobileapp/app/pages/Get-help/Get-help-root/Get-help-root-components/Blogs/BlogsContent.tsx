import React from 'react'
import { View } from 'react-native'
import BlogsList from './Blogs-list/BlogsList'
import GetHelpSearchBar from '../Get-help-search-bar/GetHelpSearchBar'
import { fetchBlogPosts } from '@/app/store/Get-help-store/getHelpSlice'
import { useAppDispatch } from '@/app/store/hooks'
import { useFocusEffect } from 'expo-router'

const BlogsContent = () => {

    const dispatch = useAppDispatch();
        useFocusEffect(React.useCallback(() => {
            dispatch(fetchBlogPosts());
    }, []));

    return (
        <View>
            <GetHelpSearchBar placeholder="Search blogs..." />
            <BlogsList />
        </View>
    )
}

export default BlogsContent
