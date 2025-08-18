
import { Post, Comment, Reaction } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum FeedTabs { ALL_UPDATES, FRIENDS };

const feedSlice = createSlice({
    name: "feed",
    initialState: {
        view: { activeHomeTab: FeedTabs.ALL_UPDATES },
        scrollViewPosition: 0,
        scrollToTopAction: true,   // trigger for performing Scroll to Top action
        feed: { posts: [] as Post[] },
        postReactionTab: 'comments',
        userPosts: { comments: [] as Comment[], reactions: [] as Reaction[] }
    },
    reducers: {
        setActiveHomeTabAction: (state, action: PayloadAction<FeedTabs>) => {
            state.view.activeHomeTab = action.payload;
        },
        setScrollViewPosition: (state, action: PayloadAction<number>) => {
            state.scrollViewPosition = action.payload;
        },
        triggerScrollToTopAction: (state, action: PayloadAction<number>) => {
            state.scrollToTopAction = !state.scrollToTopAction;
        },
        setFeedDataAction: (state, action: PayloadAction<Post[]>) => {
            state.feed.posts = action.payload
        },
        updatePostsForFeedAction: (state, action: PayloadAction<string>) => {},
        postNewPostAction: (state, action: PayloadAction<{content: string}>) => {},
        postComment: (state, action: PayloadAction<{postId: number, content: string}>) => {},
        setPostReactionTab: (state, action: PayloadAction<string>) => {
            state.postReactionTab = action.payload;
        },
        postLikePost: (state, action: PayloadAction<{postId: number}>) => {},
        postReactionToPost: (state, action: PayloadAction<{postId: number, reactionType: string}>) => {},
        retrievePostReactions: (state, action: PayloadAction<{postId: number}>) => {},   // retrieves both comments and reactions
        setComments:  (state, action: PayloadAction<Comment[]>) => {
            state.userPosts.comments = action.payload;
        },
        setReactions:  (state, action: PayloadAction<Reaction[]>) => {
            state.userPosts.reactions = action.payload;
        }

    },
});


export const { setActiveHomeTabAction, setFeedDataAction, updatePostsForFeedAction, 
    postNewPostAction, postComment, setPostReactionTab, 
    postLikePost, postReactionToPost, setComments, 
    setReactions, retrievePostReactions, setScrollViewPosition, triggerScrollToTopAction } = feedSlice.actions;
export default feedSlice.reducer;
