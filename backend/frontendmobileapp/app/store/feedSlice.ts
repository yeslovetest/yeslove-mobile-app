
import { FeedApiFactory, Post } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum FeedTabs { ALL_UPDATES, FRIENDS };

const feedSlice = createSlice({
    name: "feed",
    initialState: {
        view: { activeHomeTab: FeedTabs.ALL_UPDATES },
        feed: { posts: [] as Post[] }
    },
    reducers: {
        setActiveHomeTabAction: (state, action: PayloadAction<FeedTabs>) => {
            state.view.activeHomeTab = action.payload;
        },
        setFeedDataAction: (state, action: PayloadAction<Post[]>) => {
            state.feed.posts = action.payload
        },
        updatePostsForFeedAction: (state, action: PayloadAction<string>) => {},
        postNewPostAction: (state, action: PayloadAction<{content: string}>) => {}
    },
});


export const { setActiveHomeTabAction, setFeedDataAction, updatePostsForFeedAction, postNewPostAction } = feedSlice.actions;
export default feedSlice.reducer;
