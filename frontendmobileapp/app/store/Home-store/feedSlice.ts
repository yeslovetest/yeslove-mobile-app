import { Post, Comment, ReactionResponse, FollowedUser,  Pagination as PaginationType } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum FeedTabs { ALL_UPDATES, FRIENDS };


const feedSlice = createSlice({
    name: "feed",
    initialState: {
        view: { activeHomeTab: FeedTabs.ALL_UPDATES },
        scrollViewPosition: 0,
        scrollToTopAction: true,   // trigger for performing Scroll to Top action
        paginationValues: {currentPage: 1, hasNextPage: true, totalPages: 1},      //default values                    
        feed: { posts: [] as Post[], friends: [] as Post[]},
        postReactionTab: 'comments',
        userPosts: { comments: [] as Comment[], reactions: [] as ReactionResponse[] },
        followedUsers: {} as Record<string, [string, string, string]>, //list of followed users with 'username' as the key
        detailedPost: {} as Post,
        mediaData: { mediaFormData: null as FormData | null },
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
        setFeedDataAction: (state, action: PayloadAction<{post: Post[], feedType: string, pagination?: Partial<PaginationType>}>) => {
            console.log("Setting feed data for type:", action.payload.feedType);
            console.log(action.payload.post)

            if (action.payload.feedType === 'all'){
                state.feed.posts =  (action.payload.pagination?.page === 1? 
                    action.payload.post : state.feed.posts.concat(action.payload.post));
                //console.log(post)
            }
            else if (action.payload.feedType === 'friends'){
                state.feed.friends = (action.payload.pagination?.page === 1? 
                    action.payload.post : state.feed.friends.concat(action.payload.post));
            }
            state.paginationValues.currentPage = action.payload.pagination?.page;
            state.paginationValues.hasNextPage = action.payload.pagination?.has_next;
            state.paginationValues.totalPages = action.payload.pagination?.total_pages;
            
        },
        updatePostsForFeedAction: (state, action: PayloadAction<{feedType: string, perPage?: number, page?: number}>) => {},
        postNewPostAction: (state, action: PayloadAction<{ requestForm: FormData }>) => {},
        storeMediaFormData: (state, action: PayloadAction<{ mediaFormData: FormData | null}>) => {
            state.mediaData.mediaFormData = action.payload.mediaFormData
        },
        retrieveOnePost: (state, action: PayloadAction<{postID: number}>) => {},
        setDetailedPost: (state, action: PayloadAction<Post>) => {
            state.detailedPost = action.payload;
        },
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
        setReactions:  (state, action: PayloadAction<ReactionResponse[]>) => {
            state.userPosts.reactions = action.payload;
        },
        fetchFollowedUsers: (state, action: PayloadAction<void>) => {},
        setFollowing: (state, action: PayloadAction<FollowedUser[]>) => {
        if (action.payload) {
            let users = action.payload.reduce((acc: Record<string, [string, string, string]>, user) => {
                acc[user?.username ] = [user.id, user.follow_type, user.profile_pic];
                return acc;
            }, {});
            state.followedUsers = users;
        }
        },
        SendFollowUser: (state, action: PayloadAction<{keycloakId: string, action: string, type: string}>) => {},
    },
});


export const { setActiveHomeTabAction, setFeedDataAction, updatePostsForFeedAction, 
    postNewPostAction, postComment, setPostReactionTab, 
    postLikePost, postReactionToPost, setComments, retrieveOnePost, setDetailedPost,
    setReactions, retrievePostReactions, setScrollViewPosition, storeMediaFormData,
    triggerScrollToTopAction, fetchFollowedUsers, setFollowing, SendFollowUser } = feedSlice.actions;
export default feedSlice.reducer;
