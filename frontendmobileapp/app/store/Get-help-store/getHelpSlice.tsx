import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BlogPost } from "@/generated-api";

const getHelpSlice = createSlice({
    name: "getHelp",
    initialState: {
        view: { activeTab: "Professionals" },
        blogs: [] as BlogPost[],
    },
    reducers: {
        setActiveGetHelpTabAction: (state, action: PayloadAction<string>) => {
            state.view.activeTab = action.payload;
        },
        fetchBlogPosts: (state, action: PayloadAction<void>) => {},
        setBlogPosts: (state, action:PayloadAction<{blogs: BlogPost[]}>) => {
            state.blogs = action.payload.blogs;
        },
    }
})

export const {
    setActiveGetHelpTabAction, fetchBlogPosts, setBlogPosts
} = getHelpSlice.actions;
export default getHelpSlice.reducer;