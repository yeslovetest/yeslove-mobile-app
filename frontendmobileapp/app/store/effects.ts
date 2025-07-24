import { call, put, takeEvery } from "redux-saga/effects";
import { fetchUserDataAction, persistUserInfoAction, storeUserDataAction } from "./profileSlice";
import { AuthApiFactory, FeedApiFactory, LoginRequest, PostResponse, ProfileApiFactory, 
  TokenResponse, UserProfile, UserQueryResponse, SignupRequest, SignupResponse, CommentResponse, 
  ReactionResponse, PostReactionToPostResponse} from "@/generated-api";
import { appSelect } from "./hooks";
import { attemptRefreshFromLocalStorageAction, logInAction, LoginState, setLoginStateAction, signupAction, setSignupMessage, setErrorMessage } from "./authSlice";
import axios, { AxiosResponse } from "axios";
import { TOKEN_REFRESH_SERVICE } from "@/ts/token-service";
import { setUserId, setName  } from "./userSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { postNewPostAction, setFeedDataAction, updatePostsForFeedAction, postComment, 
   setComments, setReactions, retrievePostReactions, postLikePost, postReactionToPost
 } from "./feedSlice";

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* saveProfileInfoEffect(action: any) {
  let userId: string = yield appSelect(state => state.user.id);
  let info: UserProfile = yield appSelect(state => state.profile.profiles[userId]);
  ProfileApiFactory()
    .putUpdateProfile(info)
    .catch((reason) => console.log("Failed to update user profile: " + reason));
}

function* handleLoginRequest(action: PayloadAction<LoginRequest>) {
  let request = action.payload;

  try{
    const loginResponse = ((yield call(AuthApiFactory().postLogin, request)) as AxiosResponse<TokenResponse>).data as TokenResponse;
    axios.defaults.headers.common['Authorization'] = loginResponse.access_token ?? "";
    TOKEN_REFRESH_SERVICE.startRefreshingToken(loginResponse.refresh_token ?? "");
    TOKEN_REFRESH_SERVICE.saveRefreshTokenToLocalStorage(loginResponse.refresh_token ?? "");
    const userQueryResponse: UserQueryResponse  = ((yield call(ProfileApiFactory().postGetUserKeycloakIdFlexible, {username: request.username})) as AxiosResponse<UserQueryResponse>).data as UserQueryResponse;
    TOKEN_REFRESH_SERVICE.saveUserIdToLocalStorage(userQueryResponse.keycloak_id ?? "")
    yield put(setUserId(userQueryResponse.keycloak_id));
    yield put(setName(request.username));
    yield put(setLoginStateAction(LoginState.LOGGED_IN));
  }catch (error) {
    console.error('Login failed:', error);
    yield put(setErrorMessage('user does not exist'));
  }
}

function* refreshFromLocalStorage(action: PayloadAction<void>){
  const refreshToken = ((yield call(TOKEN_REFRESH_SERVICE.loadRefreshTokenFromLocalStorage))) as string | null;
  if(!!refreshToken){
    try{
      const refreshResponse = ((yield call(AuthApiFactory().postRefreshToken, {refresh_token: refreshToken})) as AxiosResponse<TokenResponse>).data as TokenResponse;
      axios.defaults.headers.common['Authorization'] = refreshResponse.access_token ?? "";
      TOKEN_REFRESH_SERVICE.startRefreshingToken(refreshResponse.refresh_token ?? "");
      TOKEN_REFRESH_SERVICE.saveRefreshTokenToLocalStorage(refreshResponse.refresh_token ?? "");
      yield put(setUserId(((yield call(TOKEN_REFRESH_SERVICE.loadUserIdFromLocalStorage))) as string | null));
      yield put(setLoginStateAction(LoginState.LOGGED_IN));
    }catch (error){
      yield put(setLoginStateAction(LoginState.LOGGED_OUT));
    }
  }else {
    yield put(setLoginStateAction(LoginState.LOGGED_OUT));
  }
}

function* updateFeed(action: PayloadAction<string>){
  const posts = ((yield call(FeedApiFactory().getFeed, {feed_type: action.payload})) as AxiosResponse<PostResponse>).data as PostResponse;
  yield put(setFeedDataAction(posts.posts ?? []));
}

function* postNewPost(action: PayloadAction<{content: string}>){
  yield call(FeedApiFactory().postCreatePost, {content: action.payload.content});
  yield put(updatePostsForFeedAction('all'));
}

function* postNewComment(action: PayloadAction<{postId: number, content: string}>){
  yield call(FeedApiFactory().postAddComment, action.payload.postId,  {content: action.payload.content});
  yield put(retrievePostReactions({postId: action.payload.postId}));
  yield put(updatePostsForFeedAction('all'));
  
}

function* handleLikePost(action: PayloadAction<{postId: number}>){
  yield call(FeedApiFactory().postLikePost, action.payload.postId,  {post_id: action.payload.postId});
}

function* handleReactionToPost(action: PayloadAction<{postId: number, reactionType: string}>){
  const response = ((yield call(FeedApiFactory().postReactToPost, action.payload.postId, {reaction_type: action.payload.reactionType})) as AxiosResponse<PostReactionToPostResponse>).data as PostReactionToPostResponse;
  console.log(response.message)
  if (response?.message?.includes('Removed') || response?.message?.includes('Added')) {
     yield put(postLikePost({postId: action.payload.postId})); 
  }
  yield put(retrievePostReactions({postId: action.payload.postId}));
  yield put(updatePostsForFeedAction('all'));
  
}

function* fetchUserProfileData(action: PayloadAction<{id: string}> ){
  let info: UserProfile = yield appSelect(state => state.profile.profiles[action.payload.id]);
  if(!info){
    const profile = ((yield call(ProfileApiFactory().getUserProfile, action.payload.id)) as AxiosResponse<UserProfile>).data as UserProfile;
    yield put(storeUserDataAction({id: action.payload.id, profile: profile}))
  }

}

function* handleSignupRequest(action: PayloadAction<SignupRequest>) {
  let request = action.payload;

  try{
    const signupResponse = ((yield call(AuthApiFactory().postSignup, request)) as AxiosResponse<SignupResponse>).data as SignupResponse;

    yield put(setSignupMessage(signupResponse.message ?? ""));
  }catch (error) {
    console.error('Sign up failed', error);
    
    yield put(setSignupMessage(String(error)));
  }
}

function* fetchPostReactions (action: PayloadAction<{postId: number}>){
  const comments = ((yield call(FeedApiFactory().getGetComments, action.payload.postId)) as AxiosResponse<CommentResponse>).data as CommentResponse;
  const reactions = ((yield call(FeedApiFactory().getReactions, action.payload.postId)) as AxiosResponse<ReactionResponse>).data as ReactionResponse;
  yield put(setComments(comments.comments ?? []));
  yield put(setReactions(reactions.reactions ?? []));
}


function* appSaga() {
  yield takeEvery(persistUserInfoAction.type, saveProfileInfoEffect);
  yield takeEvery(logInAction.type, handleLoginRequest);
  yield takeEvery(attemptRefreshFromLocalStorageAction.type, refreshFromLocalStorage);
  yield takeEvery(updatePostsForFeedAction.type, updateFeed);
  yield takeEvery(postNewPostAction.type, postNewPost);
  yield takeEvery(fetchUserDataAction.type, fetchUserProfileData);
  yield takeEvery(signupAction.type, handleSignupRequest);
  yield takeEvery(postComment.type, postNewComment);
  yield takeEvery(retrievePostReactions.type, fetchPostReactions);
  yield takeEvery(postReactionToPost.type, handleReactionToPost);
  yield takeEvery(postLikePost.type, handleLikePost);

}

export default appSaga;
