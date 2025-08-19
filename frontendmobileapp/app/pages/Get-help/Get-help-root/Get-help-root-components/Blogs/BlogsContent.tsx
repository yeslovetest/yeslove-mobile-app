import React from 'react'
import { View } from 'react-native'
import BlogsList from './Blogs-list/BlogsList'
import GetHelpSearchBar from '../Get-help-search-bar/GetHelpSearchBar'

const BlogsContent = () => {
    return (
        <View>
            <GetHelpSearchBar placeholder="Search blogs..." />
            <BlogsList />
        </View>
    )
}

export default BlogsContent
