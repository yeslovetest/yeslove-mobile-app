import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BlogPostList, BlogPostModel, ProfessionalResponse } from "@/generated-api";

const getHelpSlice = createSlice({
    name: "getHelp",
    initialState: {
        view: { activeTab: "Professionals" },
        scrollViewPosition: 0,
        blogs: [] as BlogPostModel[],
        totalBlogs: 0,
        blogPage: 1,
        blogsPerPage: 10,
        currentSearchQuery: '',
        oneBlog: {} as BlogPostModel,
        professionals: [] as ProfessionalResponse[],
        totalProfessionals: 0,
        professionalPage: 1,
        professionalsPerPage: 20, 
    },
    reducers: {
        setActiveGetHelpTabAction: (state, action: PayloadAction<string>) => {
            state.view.activeTab = action.payload;
        },
        setGetHelpScrollViewPosition: (state, action: PayloadAction<number>) => {
            state.scrollViewPosition = action.payload;
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
        fetchProfessionals: (state, action: PayloadAction<{perPage?: number, currentPage?: number}>) => {},
        setProfessionals: (state, action:PayloadAction<{items: ProfessionalResponse[]; total: number; page: number; per_page: number}>) => {
            state.professionals = action.payload.items || [];
            state.totalProfessionals = action.payload.total || 0;
            state.professionalPage = action.payload.page || 1;
            state.professionalsPerPage = action.payload.per_page || 20;
        },
        fetchOneBlogPost: (state, action:PayloadAction<{blogId: number}>) => {},     
        setOneBlogPost: (state, action:PayloadAction<BlogPostModel>) => {
            state.oneBlog = action.payload;    
        },
    }
})

export const {
    setActiveGetHelpTabAction, setGetHelpScrollViewPosition, fetchBlogPosts, setBlogPosts, setSearchQuery,
    fetchProfessionals, setProfessionals, fetchOneBlogPost, setOneBlogPost
} = getHelpSlice.actions;
export default getHelpSlice.reducer;