import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BlogPostList, BlogPostModel } from "@/generated-api";

const getHelpSlice = createSlice({
    name: "getHelp",
    initialState: {
        view: { activeTab: "Professionals" },
        blogs: [] as BlogPostModel[],
        totalBlogs: 0,
        blogPage: 1,
        blogsPerPage: 10,
        currentSearchQuery: '',
    },
    reducers: {
        setActiveGetHelpTabAction: (state, action: PayloadAction<string>) => {
            state.view.activeTab = action.payload;
        },
        fetchBlogPosts: (state, action: PayloadAction<{searchquery?: string, perPage?: number, currentPage?: number}>) => {},
        setBlogPosts: (state, action:PayloadAction<{blogs: BlogPostList}>) => {
            state.blogs = action.payload.blogs.items || [];
            state.totalBlogs = action.payload.blogs.total || 0;
            state.blogPage = action.payload.blogs.page || 1;
            state.blogsPerPage = action.payload.blogs.per_page || 10;
        },
        setSearchQuery: (state, action:PayloadAction<string>) => {
            state.currentSearchQuery = action.payload;      
        },
    }
})

export const {
    setActiveGetHelpTabAction, fetchBlogPosts, setBlogPosts, setSearchQuery
} = getHelpSlice.actions;
export default getHelpSlice.reducer;