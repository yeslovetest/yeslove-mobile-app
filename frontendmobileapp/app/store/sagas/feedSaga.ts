import { call, put, takeEvery } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";

import {
  FeedApiFactory,
  GetCommentResponse,
  GetFollowingResponse,
  GetReactionsResponse,
  Post,
  PostResponse,
  ReactToPostResponse,
} from "@/generated-api";
import { TOKEN_REFRESH_SERVICE } from "@/ts/token-service";
import { normalizeMediaFiles } from "./sagaHelpers";

import { openTabOnTopAction, TabType } from "../Navigation/navigationSlice";
import {
  deletePostAction,
  fetchFollowedUsers,
  postComment,
  postLikePost,
  postNewPostAction,
  postReactionToPost,
  removePostFromFeed,
  retrieveOnePost,
  retrievePostReactions,
  SendFollowUser,
  setComments,
  setDetailedPost,
  setFeedDataAction,
  setFollowing,
  setReactions,
  updatePostsForFeedAction,
} from "../Home-store/feedSlice";

function* updateFeed(
  action: PayloadAction<{
    feedType: string;
    perPage: number | undefined;
    page: number | undefined;
  }>,
) {
  const response = (
    (yield call(
      FeedApiFactory().getFeed,
      action.payload.perPage,
      action.payload.page,
      action.payload.feedType,
    )) as AxiosResponse<PostResponse>
  ).data as PostResponse;
  //console.log(action.payload.feedType)
  //console.log(response)
  yield put(
    setFeedDataAction({
      post: response.posts ?? [],
      feedType: action.payload.feedType,
      pagination: response.pagination,
    }),
  );
}

function* handleGetOnePost(action: PayloadAction<{ postID: number }>) {
  try {
    const post = (
      (yield call(FeedApiFactory().getGetPost, action.payload.postID)) as AxiosResponse<Post>
    ).data as Post;
    //console.log(post)
    yield put(setDetailedPost(post));
    yield put(retrievePostReactions({ postId: action.payload.postID }));
    yield put(openTabOnTopAction({ type: TabType.INDIVIDUAL_POST, data: post }));
  } catch (error) {
    console.error("failed to get one single Post", error);
  }
}

function* postNewPost(
  action: PayloadAction<{
    content: string;
    anonymous: boolean;
    mediaFiles?: Array<{ uri: string; type: string; name?: string }>;
  }>,
) {
  try {
    const content = action.payload.content?.trim() ?? "";
    if (!content) {
      console.warn("Skipping post creation: content cannot be empty.");
      return;
    }

    // Keep payload aligned with backend parser: anonymous as "true"/"false" and repeated media files.
    const normalizedMedia = normalizeMediaFiles(action.payload.mediaFiles);

    yield call(
      FeedApiFactory().postCreatePost,
      content,
      action.payload.anonymous ? "true" : "false",
      normalizedMedia.length ? normalizedMedia : undefined,
    );

    yield put(updatePostsForFeedAction({ feedType: "all" }));
    yield put(updatePostsForFeedAction({ feedType: "friends" }));
  } catch (error) {
    console.error("❌ Error creating post:", error);
  }
}

function* handleDeletePost(action: PayloadAction<{ postId: number }>) {
  try {
    // TODO: The delete-post endpoint does not exist on the API yet. Once the
    // backend adds it, expose it on FeedApiFactory (e.g. `deletePost`) and
    // uncomment the call below so the deletion is persisted server-side.
    //
    // yield call(FeedApiFactory().deletePost, action.payload.postId);

    // Optimistically drop the post from the feed so it disappears immediately.
    yield put(removePostFromFeed({ postId: action.payload.postId }));
  } catch (error) {
    console.error("❌ Error deleting post:", error);
    // If the endpoint is wired up later and fails, refresh the feed so the
    // optimistically-removed post reappears.
    yield put(updatePostsForFeedAction({ feedType: "all" }));
    yield put(updatePostsForFeedAction({ feedType: "friends" }));
  }
}

function* postNewComment(action: PayloadAction<{ postId: number; content: string }>) {
  yield call(FeedApiFactory().postAddComment, action.payload.postId, {
    content: action.payload.content,
  });
  yield put(retrievePostReactions({ postId: action.payload.postId }));
  yield put(updatePostsForFeedAction({ feedType: "all" }));
  yield put(updatePostsForFeedAction({ feedType: "friends" }));
}

function* handleGetFollowing(action: PayloadAction<void>) {
  let userId = (yield call([
    TOKEN_REFRESH_SERVICE,
    TOKEN_REFRESH_SERVICE.loadUserIdFromLocalStorage,
  ])) as string;
  const users = (
    (yield call(
      FeedApiFactory().getGetFollowing,
      userId,
      {},
    )) as AxiosResponse<GetFollowingResponse>
  ).data as GetFollowingResponse;
  yield put(setFollowing(users.following ?? []));
}

function* handlePostFollowUser(
  action: PayloadAction<{ keycloakId: string; action: string; type: string }>,
) {
  try {
    yield call(FeedApiFactory().postFollowUser, action.payload.keycloakId, {
      action: action.payload.action,
      follow_type: action.payload.type,
    });
    yield put(fetchFollowedUsers());
  } catch (error) {
    console.error("password change failed", error);
  }
}

function* handleLikePost(action: PayloadAction<{ postId: number }>) {
  yield call(FeedApiFactory().postLikePost, action.payload.postId, {
    post_id: action.payload.postId,
  });
}

function* handleReactionToPost(action: PayloadAction<{ postId: number; reactionType: string }>) {
  const response = (
    (yield call(FeedApiFactory().postReactToPost, action.payload.postId, {
      reaction_type: action.payload.reactionType,
    })) as AxiosResponse<ReactToPostResponse>
  ).data as ReactToPostResponse;
  if (response?.message?.includes("Removed") || response?.message?.includes("Added")) {
    yield put(postLikePost({ postId: action.payload.postId }));
  }
  yield put(retrievePostReactions({ postId: action.payload.postId }));
  yield put(updatePostsForFeedAction({ feedType: "all" }));
  yield put(updatePostsForFeedAction({ feedType: "friends" }));
}

function* fetchPostReactions(action: PayloadAction<{ postId: number }>) {
  const comments = (
    (yield call(
      FeedApiFactory().getGetComments,
      action.payload.postId,
    )) as AxiosResponse<GetCommentResponse>
  ).data as GetCommentResponse;
  const reactions = (
    (yield call(
      FeedApiFactory().getGetReactions,
      action.payload.postId,
    )) as AxiosResponse<GetReactionsResponse>
  ).data as GetReactionsResponse;
  yield put(setComments(comments.comments ?? []));
  yield put(setReactions(reactions.reactions ?? []));
}

export default function* feedSaga() {
  yield takeEvery(updatePostsForFeedAction.type, updateFeed);
  yield takeEvery(postNewPostAction.type, postNewPost);
  yield takeEvery(postComment.type, postNewComment);
  yield takeEvery(retrievePostReactions.type, fetchPostReactions);
  yield takeEvery(postReactionToPost.type, handleReactionToPost);
  yield takeEvery(postLikePost.type, handleLikePost);
  yield takeEvery(fetchFollowedUsers.type, handleGetFollowing);
  yield takeEvery(SendFollowUser.type, handlePostFollowUser);
  yield takeEvery(retrieveOnePost.type, handleGetOnePost);
  yield takeEvery(deletePostAction.type, handleDeletePost);
}
