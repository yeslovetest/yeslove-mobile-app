import { call, put, takeEvery } from "redux-saga/effects";
import { fetchUserDataAction, getEmailNotificationSettings, getProfileVisibilitySettings, persistUserInfoAction, setEmailNotificationSettings, setProfileVisibilitySettings, storeUserDataAction, updateEmailNotificationSettings, updateProfileVisibilitySettings } from "./profileSlice";
import { AuthApiFactory, FeedApiFactory, LoginRequest, PostResponse, ProfileApiFactory, 
  TokenResponse, UserProfile, UserQueryResponse, SignupRequest, SignupResponse, CommentResponse, 
  ReactionResponse, PostReactionToPostResponse,
  ChangePasswordRequest,
  DeleteAccountRequest,
  EmailNotificationSettings,
  ProfileVisibilitySettings,
  GetFollowingResponse} from "@/generated-api";
import { appSelect } from "./hooks";
import { attemptRefreshFromLocalStorageAction, logInAction, 
  LoginState, setLoginStateAction, signupAction, 
  setSignupMessage, setErrorMessage, setUserPassword, 
  setMessage,
  setDeleteConfirmation,
  logoutAction} from "./authSlice";
import axios, { AxiosResponse } from "axios";
import { TOKEN_REFRESH_SERVICE } from "@/ts/token-service";
import { setUserId, setName, setPassword  } from "./userSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { postNewPostAction, setFeedDataAction, updatePostsForFeedAction, postComment, 
   setComments, setReactions, retrievePostReactions, postLikePost, postReactionToPost,
   setFollowing,
   fetchFollowedUsers,
   SendFollowUser
 } from "./feedSlice";
import { changeTabAction, TabType } from "./navigationSlice";

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
    yield call(TOKEN_REFRESH_SERVICE.saveRefreshTokenToLocalStorage, loginResponse.refresh_token ?? "");
    const userQueryResponse: UserQueryResponse  = ((yield call(ProfileApiFactory().postGetUserKeycloakIdFlexible, {username: request.username})) as AxiosResponse<UserQueryResponse>).data as UserQueryResponse;
    yield call(TOKEN_REFRESH_SERVICE.saveUserIdToLocalStorage, userQueryResponse.keycloak_id ?? "");
    yield put(setUserId(userQueryResponse.keycloak_id));
    yield put(setName(request.username));
    yield put(setPassword(request.password));
    yield put(setLoginStateAction(LoginState.LOGGED_IN));
  }catch (error) {
    console.error('Login failed:', error);
    yield put(setErrorMessage('user does not exist'));
  }
}

function* refreshFromLocalStorage(action: PayloadAction<void>){
  const refreshToken = ((yield call(TOKEN_REFRESH_SERVICE.loadRefreshTokenFromLocalStorage))) as string | null;
  if(refreshToken){
    try{
      const refreshResponse = ((yield call(AuthApiFactory().postRefreshToken, {refresh_token: refreshToken})) as AxiosResponse<TokenResponse>).data as TokenResponse;
      axios.defaults.headers.common['Authorization'] = refreshResponse.access_token ?? "";
      TOKEN_REFRESH_SERVICE.startRefreshingToken(refreshResponse.refresh_token ?? "");
      yield call(TOKEN_REFRESH_SERVICE.saveRefreshTokenToLocalStorage, refreshResponse.refresh_token ?? "");
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
  yield put(setFeedDataAction({post: posts.posts ?? [], feedType: action.payload}));
}

function* postNewPost(action: PayloadAction<{content: string}>){
  yield call(FeedApiFactory().postCreatePost, {content: action.payload.content});
  yield put(updatePostsForFeedAction('all'));
  yield put(updatePostsForFeedAction('friends'));
}

function* postNewComment(action: PayloadAction<{postId: number, content: string}>){
  yield call(FeedApiFactory().postAddComment, action.payload.postId,  {content: action.payload.content});
  yield put(retrievePostReactions({postId: action.payload.postId}));
  yield put(updatePostsForFeedAction('all'));
  yield put(updatePostsForFeedAction('friends'));
}

function* handleGetFollowing(action: PayloadAction<void>){
  let userId = (((yield call(TOKEN_REFRESH_SERVICE.loadUserIdFromLocalStorage))) as string);
  const users = ((yield call(FeedApiFactory().getGetFollowing, userId, {})) as AxiosResponse<GetFollowingResponse>).data as GetFollowingResponse;
  yield put(setFollowing(users.following ?? []));
}

function* handlePostFollowUser(action: PayloadAction<{keycloakId: string, action: string, type: string}>) {
  try{
    yield call(FeedApiFactory().postFollowUser, action.payload.keycloakId, 
    {action: action.payload.action, follow_type: action.payload.type});
    yield put(fetchFollowedUsers());
  }catch (error) {
    console.error('password change failed', error);   
  }
}

function* handleLikePost(action: PayloadAction<{postId: number}>){
  yield call(FeedApiFactory().postLikePost, action.payload.postId,  {post_id: action.payload.postId});
}
 
function* handleReactionToPost(action: PayloadAction<{postId: number, reactionType: string}>){
  const response = ((yield call(FeedApiFactory().postReactToPost, action.payload.postId, {reaction_type: action.payload.reactionType})) as AxiosResponse<PostReactionToPostResponse>).data as PostReactionToPostResponse;
  if (response?.message?.includes('Removed') || response?.message?.includes('Added')) {
     yield put(postLikePost({postId: action.payload.postId})); 
  }
  yield put(retrievePostReactions({postId: action.payload.postId}));
  yield put(updatePostsForFeedAction('all'));
  yield put(updatePostsForFeedAction('friends'));
  
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

function* handleLogout(action: PayloadAction<string>) {
  try {
    yield call(AuthApiFactory().postLogout, { refresh_token: action.payload });

    // Stop the refresh token polling synchronously
    TOKEN_REFRESH_SERVICE.stopRefreshingToken();
    yield call(TOKEN_REFRESH_SERVICE.saveRefreshTokenToLocalStorage, '');
    yield call(TOKEN_REFRESH_SERVICE.saveUserIdToLocalStorage, '');
    yield put(changeTabAction({ type: TabType.HOME }));
    yield put(setLoginStateAction(LoginState.LOGGED_OUT));
    yield put(setFeedDataAction([]));
    yield put(setEmailNotificationSettings([]));
    yield put(setProfileVisibilitySettings([]));
  } catch (error) {
    console.error('Logout Failed!', error);
  }
}

function* handlePasswordChange(action: PayloadAction<ChangePasswordRequest>) {
  let request = action.payload;

  try{
    yield call(AuthApiFactory().postChangePassword, request);
    yield put(setMessage('Password change successful!'));
    yield put(setPassword(request.new_password));
    
  }catch (error) {
    console.error('password change failed', error);
    
  }
}

function* handleDeleteAccount(action: PayloadAction<DeleteAccountRequest>) {
  const refreshToken = ((yield call(TOKEN_REFRESH_SERVICE.loadRefreshTokenFromLocalStorage))) as string;
  try{
    yield call(AuthApiFactory().deleteDeleteAccount, action.payload);
    yield put(logoutAction(refreshToken || ''));
  }
  catch (error) {
    console.error('Delete action failed', error);
  }
}

function* fetchEmailNotificationSettings(action: PayloadAction<void>){
  const emailNotificationSettings = ((yield call(ProfileApiFactory().getEmailNotifications)) as AxiosResponse<EmailNotificationSettings>).data as EmailNotificationSettings;
  yield put(setEmailNotificationSettings(emailNotificationSettings.settings ?? []));
}

function* updateEmailSettings(action: PayloadAction<EmailNotificationSettings>){
  
  try{
    yield call(ProfileApiFactory().postEmailNotifications, action.payload);
    yield put(setMessage('Email Notification Settings Saved!'));
  }catch (error) {
    console.error('email notification setting failed', error);
  }
}

function* fetchProfileVisiblitySettings(action: PayloadAction<void>){
  const profileVisibilitySettings = ((yield call(ProfileApiFactory().getProfileVisibility)) as AxiosResponse<ProfileVisibilitySettings>).data as ProfileVisibilitySettings;
  yield put(setProfileVisibilitySettings(profileVisibilitySettings.settings ?? []));
}

function* updateProfileSettings(action: PayloadAction<ProfileVisibilitySettings>){
  
  try{
    yield call(ProfileApiFactory().postProfileVisibility, action.payload);
    yield put(setMessage('Profile Visibility Settings Saved!'));
  }catch (error) {
    console.error('profile visibility setting failed', error);
  }
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
  yield takeEvery(logoutAction.type, handleLogout);
  yield takeEvery(setUserPassword.type, handlePasswordChange);
  yield takeEvery(setDeleteConfirmation.type, handleDeleteAccount);
  yield takeEvery(getEmailNotificationSettings.type, fetchEmailNotificationSettings);
  yield takeEvery(updateEmailNotificationSettings.type, updateEmailSettings);
  yield takeEvery(getProfileVisibilitySettings.type, fetchProfileVisiblitySettings);
  yield takeEvery(updateProfileVisibilitySettings.type, updateProfileSettings);
  yield takeEvery(fetchFollowedUsers.type, handleGetFollowing);
  yield takeEvery(SendFollowUser.type, handlePostFollowUser);
}

export default appSaga;
