import React, { useEffect } from 'react'
import { View } from 'react-native'
import BlogsList from './Blogs-list/BlogsList'
import GetHelpSearchBar from '../Get-help-search-bar/GetHelpSearchBar'
import { fetchBlogPosts, setSearchQuery } from '@/app/store/Get-help-store/getHelpSlice'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import BlogPaginator from '../../../../../Universal-components/Paginator/Paginator'

const BlogsContent = () => {

    const dispatch = useAppDispatch();

    const blogs = useAppSelector(state => state.getHelp.blogs);
    const searchWord = useAppSelector(state => state.getHelp.currentSearchQuery);
    const currentPage = useAppSelector(state => state.getHelp.blogPage);
    const totalBlogs = useAppSelector(state => state.getHelp.totalBlogs);
    const blogsPerPage = useAppSelector(state => state.getHelp.blogsPerPage);
    const totalPages = Math.ceil(totalBlogs / blogsPerPage); // Calculate total pages

    useEffect(() => {
        // Load initial blogs only when no user-specific pagination/search context exists.
        if (blogs.length === 0 && currentPage === 1 && !searchWord) {
            dispatch(fetchBlogPosts({}));
        }
    }, [blogs.length, currentPage, searchWord, dispatch]);

    const handlePageChange = (page: number) => {
        dispatch(fetchBlogPosts({ currentPage: page, searchquery: searchWord }));
        dispatch(setSearchQuery(searchWord)); // Maintain the current search query when changing pages
    }   

    return (
        <View style={{ width: '100%' }}>
            <GetHelpSearchBar placeholder="Enter Keyword..." currentSection='blogs'/>
            <BlogsList />
            {totalPages > 0 && (
                <BlogPaginator currentPage={currentPage ?? 1} totalPages={totalPages ?? 1} 
                    onPageChange={(page) => handlePageChange(page)} 
                />
            )}
            
        </View>
    )
}

export default BlogsContent
