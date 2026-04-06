import { call, put, take, takeEvery, takeLatest, race, delay } from "redux-saga/effects";
import { activateLoadingScreen, fetchUserDataAction, getEmailNotificationSettings, getProfileVisibilitySettings, persistUserInfoAction, setEmailNotificationSettings, setProfileImageUploading, setProfileVisibilitySettings, setUserProfileState, storeUserDataAction, updateEmailNotificationSettings, updateProfile, updateProfileVisibilitySettings } from "../Profile-store/profileSlice";
import { AuthApiFactory, FeedApiFactory, LoginRequest, PostResponse, ProfileApiFactory, 
  TokenResponse, UserProfile, SignupRequest, SignupResponse, GetCommentResponse,
  GetReactionsResponse, ReactToPostResponse,
  ChangePasswordRequest, DeleteAccountRequest,
  EmailNotificationSettings, ProfileVisibilitySettings,
  GetFollowingResponse, ChatApiFactory,
  GetMessagesResponse, BlogApiFactory, BlogPostList,
  MarkChatOpenedResponse, GetFriendsResponse, 
  EventsApiFactory, EventListResponse,
  ProfessionalsListResponse,
  MediaListResponse,
  MediaApiFactory,
  NotificationsApiFactory,
  NotificationListResponse,
  Post, EventInfoResponse, BlogPostModel,
  NotificationPreferences
  } from "@/generated-api";
import { appSelect } from "../hooks";
import { attemptRefreshFromLocalStorageAction, logInAction, 
  LoginState, setLoginStateAction, signupAction, 
  setSignupMessage, setErrorMessage, setUserPassword, 
  setMessage,
  setSignupSubmitting,
  setDeleteConfirmation,
  logoutAction} from "../Auth-store/authSlice";
import axios, { AxiosResponse } from "axios";
import { TOKEN_REFRESH_SERVICE } from "@/ts/token-service";
import { setUserId, setName, setPassword, setUserDBID  } from "../Profile-store/userSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { postNewPostAction, setFeedDataAction, updatePostsForFeedAction, postComment, 
   setComments, setReactions, retrievePostReactions, postLikePost, postReactionToPost,
   setFollowing,
   fetchFollowedUsers,
   SendFollowUser, retrieveOnePost, setDetailedPost,
   setPostReactionTab
 } from "../Home-store/feedSlice";
import { changeTabAction, openTabOnTopAction, TabType } from "../Navigation/navigationSlice";
import { setChatMessages, fetchChatMessages, sendChatMessage, markChatOpened, setFriendList, fetchFriendList,
   sendChatbotMessage, setChatbotResponse
 } from "../Chat/chatSlice";
import { setBlogPosts, fetchBlogPosts, fetchProfessionals, setProfessionals,
    fetchOneBlogPost, setOneBlogPost
 } from "../Get-help-store/getHelpSlice";
import { fetchAllEvents, fetchUserEvents, setAllEvents,
   setUserEvents, addAttendeeToEvent, removeAttendeeFromEvent,
   fetchOneEvent, setOneEvent } from "../Events-store/eventsSlice";
import { fetchMediaItems, setMediaItems, setUploadedMediaId, uploadBulkMedia, uploadMedia } from "../Profile-store/mediaSlice";
import { fetchUserNotifications, markNotificationRead, setUserNotification,
   fetchNotificationPreferences, setNotificationPreferences,
   updateNotificationPreferences
 } from "../Notification-store/notificationSlice";
import { ChatRequest, ChatResponse as ChatbotApiResponse, apiFactory as chatbotApiFactory } from "@/chatbot-client-api/api";
import dataURLtoFile from '@/utils/mediaUrlConverter';


/**
 * Extract HTTP status from an unknown error value.
 * Returns undefined when the error is not an Axios error.
 */
const getHttpStatus = (error: unknown): number | undefined => {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
};

/**
 * Extract API message from common backend payload shapes.
 * Supports both { message } and { error } response formats.
 */
const getApiMessage = (error: unknown): string | undefined => {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  const responseData = error.response?.data as { message?: string; error?: string } | undefined;
  return responseData?.message || responseData?.error;
};

/**
 * Clear persisted auth state so the app can safely return to sign-in.
 */
const clearPersistedAuthState = async (): Promise<void> => {
  TOKEN_REFRESH_SERVICE.stopRefreshingToken();
  await TOKEN_REFRESH_SERVICE.saveRefreshTokenToLocalStorage('');
  await TOKEN_REFRESH_SERVICE.saveAccessToken('');
  await TOKEN_REFRESH_SERVICE.saveUserIdToLocalStorage('');
  await TOKEN_REFRESH_SERVICE.saveUserDBIDToLocalStorage(-1);
  delete axios.defaults.headers.common['Authorization'];
};

/**
 * Translate signup HTTP failures into user-friendly guidance.
 */
const getSignupFriendlyMessage = (status?: number, apiMessage?: string): string => {
  if (apiMessage) {
    return apiMessage;
  }

  if (status === 400) {
    return 'Please check your details and try again.';
  }

  if (status === 401 || status === 403) {
    return 'You are not allowed to complete signup right now. Please try again later.';
  }

  if (status === 409) {
    return 'An account with these details already exists.';
  }

  if (status === 429) {
    return 'Too many signup attempts. Please wait a moment and try again.';
  }

  if (status && status >= 500) {
    return 'Server is busy right now. Please try again shortly.';
  }

  return 'We could not complete signup right now. Please try again.';
};

type UserIdentityResponse = {
  keycloak_id?: string;
  user_id?: number;
  username?: string;
  email?: string;
};


/** 
 * Auth Api 
 * */
function* handleLoginRequest(action: PayloadAction<LoginRequest>) {
  const request = action.payload;

  type LoginResponseWithIdentity = TokenResponse & {
    keycloak_id?: string;
    user_id?: number;
  };

  let loginResponse: LoginResponseWithIdentity;

  try {
    loginResponse = ((yield call(AuthApiFactory().postLogin, request)) as AxiosResponse<LoginResponseWithIdentity>).data as LoginResponseWithIdentity;
  } catch (error) {
    console.error('Login failed:', error);

    const status = getHttpStatus(error);
    const apiMessage = getApiMessage(error);
    let friendlyMessage = apiMessage;

    if (!friendlyMessage) {
      // Map technical auth failures to user-facing messages.
      if (status === 400 || status === 401) {
        friendlyMessage = 'Incorrect login details. Please check and try again.';
      } else if (status === 429) {
        friendlyMessage = 'Too many attempts. Please wait a moment and try again.';
      } else {
        friendlyMessage = 'Unable to sign in right now. Please try again.';
      }
    }

    yield put(setErrorMessage(friendlyMessage));
    yield put(setLoginStateAction(LoginState.LOGGED_OUT));
    yield put(activateLoadingScreen(false));
    return;
  }
  //console.log('Login successful:', loginResponse);
  const accessToken = loginResponse.access_token ?? "";
  const refreshToken = loginResponse.refresh_token ?? "";

  // A successful login response should always route the user to home.
  // Any post-login sync/storage failures are treated as best-effort warnings.
  try {
    axios.defaults.headers.common['Authorization'] = accessToken ? `Bearer ${accessToken}` : "";
    yield call([TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.saveAccessToken], accessToken);

    if (refreshToken) {
      TOKEN_REFRESH_SERVICE.startRefreshingToken(refreshToken);
    } else {
      TOKEN_REFRESH_SERVICE.stopRefreshingToken();
    }
    yield call([TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.saveRefreshTokenToLocalStorage], refreshToken);

    // Never fail a successful auth response because local sync/lookup is delayed.
    let resolvedKeycloakId = loginResponse.keycloak_id ?? "";
    let resolvedUserDbId = typeof loginResponse.user_id === 'number' ? loginResponse.user_id : -1;

    // Ensure local DB user exists for protected endpoints that depend on backend user rows.
    try {
      const syncResponse = ((yield call(axios.post, '/api/auth/sync_user', {
        username: request.username,
      })) as AxiosResponse<UserIdentityResponse>).data as UserIdentityResponse;

      if (syncResponse?.keycloak_id) {
        resolvedKeycloakId = syncResponse.keycloak_id;
      }

      if (typeof syncResponse?.user_id === 'number') {
        resolvedUserDbId = syncResponse.user_id;
      }
    } catch (syncError) {
      console.warn('sync_user failed, falling back to profile lookup', syncError);
    }

    if (!resolvedKeycloakId) {
      try {
        const identityResponse = ((yield call(
          ProfileApiFactory().postGetUserKeycloakId
        )) as AxiosResponse<UserIdentityResponse>).data as UserIdentityResponse;

        if (identityResponse?.keycloak_id) {
          resolvedKeycloakId = identityResponse.keycloak_id;
        }

        if (typeof identityResponse?.user_id === 'number') {
          resolvedUserDbId = identityResponse.user_id;
        }
      } catch (identityError) {
        console.warn('profile identity lookup failed after login', identityError);
      }
    }

    if (!resolvedKeycloakId) {
      console.warn('login succeeded but keycloak_id is unavailable; continuing to logged-in state');
    }

    yield call([TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.saveUserIdToLocalStorage], resolvedKeycloakId);
    yield call([TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.saveUserDBIDToLocalStorage], resolvedUserDbId);
    yield put(setUserId(resolvedKeycloakId));
    yield put(setUserDBID(resolvedUserDbId));
    yield put(setName(request.username));
    yield put(setPassword(request.password));
  } catch (postLoginError) {
    console.warn('post-login setup failed; continuing to logged-in state', postLoginError);
  }

  yield put(setErrorMessage(''));
  yield put(setLoginStateAction(LoginState.LOGGED_IN));
  yield put(activateLoadingScreen(false));
}

function* refreshFromLocalStorage(action: PayloadAction<void>){
  try {
    const refreshToken = ((yield call([TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.loadRefreshTokenFromLocalStorage]))) as string | null;
    const normalizedRefreshToken = (refreshToken || "").trim();

    if(!normalizedRefreshToken) {
      yield put(setErrorMessage(''));
      yield put(setLoginStateAction(LoginState.LOGGED_OUT));
      return;
    }

    try{
      // Enforce a hard timeout so bootstrap can never keep the app in LOADING forever.
      const refreshResult: {
        refreshedResponse?: AxiosResponse<TokenResponse>;
        timedOut?: true;
      } = yield race({
        refreshedResponse: call(
          AuthApiFactory().postRefreshToken,
          {refresh_token: normalizedRefreshToken},
          { timeout: 10000 }
        ),
        timedOut: delay(12000),
      });

      if (refreshResult.timedOut || !refreshResult.refreshedResponse) {
        throw new Error("AUTH_BOOTSTRAP_TIMEOUT");
      }

      const refreshResponse = (refreshResult.refreshedResponse.data as TokenResponse);
      const refreshedAccessToken = refreshResponse.access_token ?? "";
      const refreshedRefreshToken = refreshResponse.refresh_token ?? "";

      // Never keep the user in a partial session when provider does not return both tokens.
      if (!refreshedAccessToken || !refreshedRefreshToken) {
        throw new Error("AUTH_TOKENS_MISSING");
      }

      axios.defaults.headers.common['Authorization'] = refreshedAccessToken ? `Bearer ${refreshedAccessToken}` : "";
      yield call([TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.saveAccessToken], refreshedAccessToken);

      if (refreshedRefreshToken) {
        TOKEN_REFRESH_SERVICE.startRefreshingToken(refreshedRefreshToken);
      } else {
        TOKEN_REFRESH_SERVICE.stopRefreshingToken();
      }

      yield call([TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.saveRefreshTokenToLocalStorage], refreshedRefreshToken);

      const storedUserId = ((yield call([TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.loadUserIdFromLocalStorage]))) as string | null;
      const storedUserDbId = ((yield call([TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.loadUserDBIDFromLocalStorage]))) as string | null;

      if (!storedUserId) {
        yield put(setLoginStateAction(LoginState.LOGGED_OUT));
        try {
          yield call(clearPersistedAuthState);
        } catch (cleanupError) {
          console.warn('auth cleanup failed after missing stored user id', cleanupError);
        }
        return;
      }

      yield put(setUserId(storedUserId));
      yield put(setUserDBID(storedUserDbId ? Number(storedUserDbId) : -1));

      let userId: string = yield appSelect(state => state.user.id);

      // Profile fetch is best-effort during bootstrap; do not block login routing if slow.
      const profileResult: {
        profileResponse?: AxiosResponse<UserProfile>;
        timedOut?: true;
      } = yield race({
        profileResponse: call(ProfileApiFactory().getUserProfile, userId, { timeout: 8000 }),
        timedOut: delay(9000),
      });

      if (profileResult.profileResponse?.data) {
        const profile = profileResult.profileResponse.data as UserProfile;
        yield put(setName(profile.username));
        yield put(storeUserDataAction({id: userId, profile: profile}));
      }

      yield put(setErrorMessage(''));
      yield put(setLoginStateAction(LoginState.LOGGED_IN));
    }catch (error){
      console.log(error)

      const status = getHttpStatus(error);
      const apiMessage = getApiMessage(error);
      const isTimeoutError = error instanceof Error && error.message === "AUTH_BOOTSTRAP_TIMEOUT";
      const isMissingTokensError = error instanceof Error && error.message === "AUTH_TOKENS_MISSING";

      if (isTimeoutError) {
        yield put(setErrorMessage('Connection took too long. Please sign in again.'));
      } else if (isMissingTokensError) {
        yield put(setErrorMessage('Session refresh failed. Please sign in again.'));
      } else if (status === 400 || status === 401) {
        yield put(setErrorMessage(apiMessage || 'Your session expired. Please sign in again.'));
      } else if (status && status >= 500) {
        yield put(setErrorMessage('Server is busy right now. Please try again shortly.'));
      } else if (apiMessage) {
        yield put(setErrorMessage(apiMessage));
      } else {
        yield put(setErrorMessage('We could not reconnect automatically. Please sign in to continue.'));
      }

      // Route first, then cleanup as best-effort so UI cannot get stuck in LOADING.
      yield put(setLoginStateAction(LoginState.LOGGED_OUT));
      try {
        yield call(clearPersistedAuthState);
      } catch (cleanupError) {
        console.warn('auth cleanup failed after refresh error', cleanupError);
      }
    }
  } catch (storageError) {
    console.warn('failed to load stored auth tokens', storageError);
    yield put(setErrorMessage('We could not read your session. Please sign in again.'));
    yield put(setLoginStateAction(LoginState.LOGGED_OUT));
  }
}

function* handleSignupRequest(action: PayloadAction<SignupRequest>) {
  let request = action.payload;

  // Keep UI actions disabled while signup request is in progress.
  yield put(setSignupSubmitting(true));

  try{
    const signupResponse = ((yield call(AuthApiFactory().postSignup, request)) as AxiosResponse<SignupResponse>).data as SignupResponse;

    // Keep provider response message so success screen can show meaningful text.
    yield put(setSignupMessage(signupResponse.message ?? ""));
  }catch (error) {
    console.error('Sign up failed', error);

    const status = getHttpStatus(error);
    const apiMessage = getApiMessage(error);
    const friendlyMessage = getSignupFriendlyMessage(status, apiMessage);

    // Render a user-safe error on the signup result screen.
    yield put(setSignupMessage(friendlyMessage));
  } finally {
    // Always re-enable signup actions after completion.
    yield put(setSignupSubmitting(false));
  }
}

function* handleLogout(action: PayloadAction<string>) {
  try {
    if (action.payload) {
      yield call(AuthApiFactory().postLogout, { refresh_token: action.payload });
    }
  } catch (error) {
    console.warn('Logout API call failed, continuing local logout cleanup', error);
  }

  try {
    // Always clear local auth/session state, even if provider logout fails.
    yield call(clearPersistedAuthState);
    yield put(changeTabAction({ type: TabType.HOME }));
    yield put(setLoginStateAction(LoginState.LOGGED_OUT));
    yield put(setFeedDataAction({post: [], feedType: 'friends'}));
    yield put(setFeedDataAction({post: [], feedType: 'all'}));
    yield put(setEmailNotificationSettings([]));
    yield put(setProfileVisibilitySettings([]));
    yield put(setChatMessages([]));
    yield put(setFriendList([]));
    yield put(activateLoadingScreen(false));

  } catch (error) {
    console.error('Logout Failed!', error);
    yield put(activateLoadingScreen(false));
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
  const refreshToken = ((yield call([TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.loadRefreshTokenFromLocalStorage]))) as string;
  try{
    yield call(AuthApiFactory().deleteDeleteAccount, action.payload);
    yield put(logoutAction(refreshToken || ''));
  }
  catch (error) {
    console.error('Delete action failed', error);
  }
}



/** 
 * BlogPost Api 
 * */
function* handleGetBlogPost(action: PayloadAction<{searchquery?: string, perPage?: number, currentPage?: number}>){
  try {
    const response = ((yield call(BlogApiFactory().getBlogPosts, action.payload.searchquery ?? undefined,
                    action.payload.perPage ?? undefined, action.payload.currentPage ?? undefined 
                  ))  as AxiosResponse<BlogPostList>).data as BlogPostList;
    yield put(setBlogPosts({blogs: response}));
  }
  catch (error) {
    console.error('failed to fetch blog posts', error);  
  }
  
}

function* handleGetOneBlogPost(action: PayloadAction<{blogId: number}>){  
  try { 
    const blog = ((yield call(BlogApiFactory().getGetSingleBlog, action.payload.blogId))  as AxiosResponse<BlogPostModel>).data as BlogPostModel;  
    yield put(setOneBlogPost(blog));   
    yield put(openTabOnTopAction({ type: TabType.INDIVIDUAL_BLOG, data: blog}));
  } catch (error) { 
    console.error('failed to fetch blog post', error);
  } 
}


/** 
 * Chat Api 
 * */
function* handleGetMessages(action: PayloadAction<string>){
  const messages = ((yield call(ChatApiFactory().getGetMessages, action.payload, {})) as AxiosResponse<GetMessagesResponse>).data as GetMessagesResponse;
  yield put(setChatMessages(messages.messages ?? []));
}

function* handlePostSendMessage(action: PayloadAction<{id: string, message: string, mediaID?: string[] | undefined}>) {
  try{
    yield call(ChatApiFactory().postSendMessage, {receiver_id: action.payload.id, 
      message: action.payload.message, media_id: action.payload.mediaID}); 
    yield put(fetchChatMessages(action.payload.id));
    yield put(setUploadedMediaId([])); // Clear uploaded media IDs after sending message
  }catch (error) {
    console.error('failed to send message', error);  
  }
}

function* updateChatOpened(action: PayloadAction<string>){
  try{
    const response = ((yield call(ChatApiFactory().putMarkChatOpened, action.payload)) as AxiosResponse<MarkChatOpenedResponse>).data as MarkChatOpenedResponse;
    //console.log(response.message);
  } catch (error) {
    console.error('failed to mark chat opened', error);  
  }
  
}

function* handleGetFriendList(action: PayloadAction<string>){
  const friends = ((yield call(ChatApiFactory().getGetFriends, action.payload, {'keycloak_id': action.payload})) as AxiosResponse<GetFriendsResponse>).data as GetFriendsResponse;
  yield put(setFriendList(friends.friends ?? []));
}


/** 
 * Chatbot (Microservice) Api 
 * */
function* handleSendChatbotMessage(action: PayloadAction<{prompt: string}>){
  try{
    const response = ((yield call(chatbotApiFactory.sendMessage, {message: action.payload.prompt})) as AxiosResponse<ChatbotApiResponse>).data as ChatbotApiResponse;  
    yield put(setChatbotResponse(response));
  }catch (error) {
    console.error('failed to send chatbot response', error);
  }
}


/** 
 * Events Api 
 * */
function* handleGetEventsList(action: PayloadAction<{endDate?: string, startDate?: string, perPage?: number, currentPage?: number}>){
  try {
    const response = ((yield call(EventsApiFactory().getEventList, action.payload.endDate ?? undefined,
          action.payload.startDate ?? undefined, action.payload.perPage ?? undefined, action.payload.currentPage ?? undefined 
    ))  as AxiosResponse<EventListResponse>).data as EventListResponse;

    yield put(setAllEvents({events: response}));
  }
  catch (error) {
    console.error('failed to fetch Events', error);  
  } 
}

function* handleGetOneEvent(action: PayloadAction<{eventId: number}>){  
  try { 
    const response = ((yield call(EventsApiFactory().getEventInfo, {event_ids: [action.payload.eventId], page: 1, per_page: 10}))  as AxiosResponse<EventInfoResponse>).data as EventInfoResponse;  
    yield put(setOneEvent(response.event_infos?.[0] ?? undefined));
    yield put(openTabOnTopAction({ type: TabType.INDIVIDUAL_EVENT, data: response.event_infos?.[0]}));

  } catch (error) { 
    console.error('failed to fetch Event', error);
  }
}

function* handleGetAttendingEvents(action: PayloadAction<{queryType: string , endDate?: string, startDate?: string, perPage?: number, currentPage?: number}>){
  try {
    const response = ((yield call(EventsApiFactory().getAttendingEvents, action.payload.endDate ?? undefined,
          action.payload.startDate ?? undefined,
          action.payload.perPage ?? undefined, 
          action.payload.currentPage ?? undefined, 
          action.payload.queryType ?? 'all' 
    ))  as AxiosResponse<EventListResponse>).data as EventListResponse;

    yield put(setUserEvents({events: response}));
  }
  catch (error) {
    console.error('failed to fetch Events', error);  
  }
}

function* handleAddAttendeeToEvent(action: PayloadAction<{eventId: number}>){ 
  try {
    yield call(EventsApiFactory().postEventAttendees,{user_id: undefined, event_id: action.payload.eventId});
    yield put(fetchAllEvents({}));
    yield put(fetchUserEvents({queryType: 'attending'}));
  }
  catch (error) {
    console.error('failed to add attendee to event', error);  
  } 
}

function* handleRemoveAttendeeFromEvent(action: PayloadAction<{eventId: number}>){ 
  try {
    yield call(EventsApiFactory().deleteRemoveAttendee, {user_id: undefined, event_id: action.payload.eventId});
    yield put(fetchAllEvents({}));
    yield put(fetchUserEvents({queryType: 'attending'}));
  }
  catch (error) {
    console.error('failed to remove attendee from event', error);  
  } 
} 

function* handleFetchProfessionals(action: PayloadAction<{perPage?: number, currentPage?: number}>){
  try {
    const response = ((yield call(EventsApiFactory().getGetProfessionals, action.payload.perPage ?? undefined, 
    action.payload.currentPage ?? undefined ))  as AxiosResponse<ProfessionalsListResponse>).data as ProfessionalsListResponse;
    const pagination = (response.pagination ?? {}) as {
      total_professionals?: number;
      page?: number;
      per_page?: number;
    };

    yield put(setProfessionals({
      items: response.professionals ?? [],
      total: pagination.total_professionals ?? 0,
      page: pagination.page ?? 1,
      per_page: pagination.per_page ?? 20,
    }));
  } 
  catch (error) {
       console.error('failed to fetch professionals', error);  
  } 
}


/** 
 * Feed Api 
 * */
function* updateFeed(action: PayloadAction<{feedType: string, perPage: number | undefined, page: number | undefined}>){
  const response = ((yield call(FeedApiFactory().getFeed, action.payload.perPage, action.payload.page, action.payload.feedType)) as AxiosResponse<PostResponse>).data as PostResponse;
  //console.log(action.payload.feedType)
  //console.log(response)
  yield put(setFeedDataAction({post: response.posts ?? [], 
    feedType: action.payload.feedType, pagination: response.pagination}));
}

function* handleGetOnePost(action: PayloadAction<{postID: number}>){
  try {
    const post = ((yield call(FeedApiFactory().getGetPost, action.payload.postID)) as AxiosResponse<Post>).data as Post;
    //console.log(post)
    yield put(setDetailedPost(post));
    yield put(retrievePostReactions({postId: action.payload.postID}));
    yield put(openTabOnTopAction({ type: TabType.INDIVIDUAL_POST, data: post}));
  } 
  catch (error) {
    console.error('failed to get one single Post', error)
  }
  
}

function* postNewPost(action: PayloadAction<{
  content: string,
  anonymous: boolean,
  mediaFiles?: Array<{ uri: string; type: string; name?: string }>
}>){
  try {
    const content = action.payload.content?.trim() ?? "";
    if (!content) {
      console.warn("Skipping post creation: content cannot be empty.");
      return;
    }

    // Keep payload aligned with backend parser: anonymous as "true"/"false" and repeated media files.
    const normalizedMedia = (action.payload.mediaFiles ?? [])
      .filter((file) => !!file?.uri && !!file?.type)
      .map((file) => {
        if (file.uri.startsWith("data:")) {
          return dataURLtoFile(
            file.uri,
            file.name ?? (file.type.startsWith("video") ? "video.mp4" : "photo.jpg")
          ) as any;
        }

        return {
          uri: file.uri,
          type: file.type,
          name: file.name ?? (file.type.startsWith("video") ? "video.mp4" : "photo.jpg"),
        } as any;
      });

    yield call(
      FeedApiFactory().postCreatePost,
      content,
      action.payload.anonymous ? "true" : "false",
      normalizedMedia.length ? normalizedMedia : undefined
    );
    
    yield put(updatePostsForFeedAction({feedType: 'all'}));
    yield put(updatePostsForFeedAction({feedType: 'friends'}));
  }
  catch (error) {
    console.error("❌ Error creating post:", error);  
  }
  
}

function* postNewComment(action: PayloadAction<{postId: number, content: string}>){
  yield call(FeedApiFactory().postAddComment, action.payload.postId,  {content: action.payload.content});
  yield put(retrievePostReactions({postId: action.payload.postId}));
  yield put(updatePostsForFeedAction({feedType: 'all'}));
  yield put(updatePostsForFeedAction({feedType: 'friends'}));
}

function* handleGetFollowing(action: PayloadAction<void>){
  let userId = (((yield call([TOKEN_REFRESH_SERVICE, TOKEN_REFRESH_SERVICE.loadUserIdFromLocalStorage]))) as string);
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
  const response = ((yield call(FeedApiFactory().postReactToPost, action.payload.postId, {reaction_type: action.payload.reactionType})) as AxiosResponse<ReactToPostResponse>).data as ReactToPostResponse;
  if (response?.message?.includes('Removed') || response?.message?.includes('Added')) {
     yield put(postLikePost({postId: action.payload.postId})); 
  }
  yield put(retrievePostReactions({postId: action.payload.postId}));
  yield put(updatePostsForFeedAction({feedType: 'all'}));
  yield put(updatePostsForFeedAction({feedType: 'friends'}));
  
}


function* fetchPostReactions (action: PayloadAction<{postId: number}>){
  const comments = ((yield call(FeedApiFactory().getGetComments, action.payload.postId)) as AxiosResponse<GetCommentResponse>).data as GetCommentResponse;
  const reactions = ((yield call(FeedApiFactory().getGetReactions , action.payload.postId)) as AxiosResponse<GetReactionsResponse>).data as GetReactionsResponse;
  yield put(setComments(comments.comments ?? []));
  yield put(setReactions(reactions.reactions ?? []));
}

/** 
 * Media Api 
 * */
function* handleGetUserMediaItems(action: PayloadAction<number>){ 
  const MediaItems = ((yield call(MediaApiFactory().getGetUserMedia, action.payload)) as AxiosResponse<MediaListResponse>).data as MediaListResponse;
  yield put(setMediaItems(MediaItems.media ?? []));
}  

function* handleUploadMedia(action: PayloadAction<{requestBody: FormData, resolve?: (ids: string[]) => void, reject?: (error: unknown) => void}>){ 
  try {
    const response = (yield call(MediaApiFactory().postUploadMedia, {data: action.payload.requestBody} )) as AxiosResponse<{media_id: string}>;
    yield put(setUploadedMediaId([response.data.media_id]));
    yield put({ type: "uploadMediaSuccess" });  // Notify Successful completion (required for creating new Post action)

    // Resolve promise - required for posting message when it contains media
    if (action.payload?.resolve) {
      action.payload.resolve([response.data.media_id]);
    }
  }
  catch (error) {
    console.error('failed to upload media', error);
    yield put({ type: "uploadMediaFailure" });
    if (action.payload?.reject) {
      action.payload.reject(error);
    }
  }
   
} 

function* handleUploadBulkMedia(action: PayloadAction<{requestBody: FormData, resolve?: (ids: string[]) => void, reject?: (error: unknown) => void}>){
  try {
    const response = (yield call(MediaApiFactory().postBulkUploadMedia, {data: action.payload.requestBody} )) as AxiosResponse<{ids: string[]}>;
    yield put(setUploadedMediaId(response.data.ids));
    yield put({ type: "uploadBulkMediaSuccess" });  // Notify Successful completion (required for creating new Post action)

    // Resolve promise - required for posting message when it contains media
     if (action.payload?.resolve) {
      action.payload.resolve(response.data.ids);
    }
  }
  catch (error) {
    console.error('failed to upload bulk media', error);
    yield put({ type: "uploadBulkMediaFailure" });
    if (action.payload?.reject) {
      action.payload.reject(error);
    }
  }
}  

/** 
 * Notification Api 
 * */
function* handleGetUserNotifications(action: PayloadAction<{perPage?: number, currentPage?: number}>){ 
  try {
    const response = ((yield call(NotificationsApiFactory().getNotificationList, action.payload.perPage ?? undefined, action.payload.currentPage ?? undefined)) as AxiosResponse<NotificationListResponse>).data as NotificationListResponse;
    yield put(setUserNotification(response));
  }
  catch (error){
    console.error('failed to retrieve notification', (error))
  } 
} 

function* updateNotificationOpened(action: PayloadAction<number>){
  try{
    yield call(NotificationsApiFactory().postMarkNotificationRead, action.payload);
    yield put(fetchUserNotifications({}));
    
  } catch (error) {
    console.error('failed to update notification', error);  
  }
  
}

function* handleGetNotificationPreferences(action: PayloadAction<void>){
  try { 
    const response = ((yield call(NotificationsApiFactory().getNotificationPreferencesResource)) as AxiosResponse<NotificationPreferences>);
    yield put(setNotificationPreferences({
      posts: !!response.data.posts,
      likes: !!response.data.likes,
      comments: !!response.data.comments,
      events: !!response.data.events,
      blogs: !!response.data.blogs,
    }));
  }
  catch (error) {
    console.error('failed to fetch notification preferences', error);  
  }
}

function* handleUpdateNotificationPreferences(action: PayloadAction<{preferences: NotificationPreferences}>) {
  try{
    yield call(NotificationsApiFactory().putNotificationPreferencesResource, action.payload.preferences);
    yield put(setMessage('Notification Preferences Saved!'));
  }catch (error) {
    console.error('notification preferences setting failed', error);
  }
} 

/** 
 * Profile Api 
 * */
// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* saveProfileInfoEffect(action: any) {
  let userId: string = yield appSelect((state: { user: { id: any; }; }) => state.user.id);
  let info: UserProfile = yield appSelect(state => state.profile.profiles[userId]);
  ProfileApiFactory()
    .putUpdateProfile(info)
    .catch((reason) => console.log("Failed to update user profile: " + reason));
}

function* fetchUserProfileData(action: PayloadAction<{id: string, isCurrentUser: boolean}> ){
  let info: UserProfile = yield appSelect(state => state.profile.profiles[action.payload.id]);
  yield put(setUserProfileState(action.payload.isCurrentUser));
  if(!info){
    const profile = ((yield call(ProfileApiFactory().getUserProfile, action.payload.id)) as AxiosResponse<UserProfile>).data as UserProfile;
    yield put(storeUserDataAction({id: action.payload.id, profile: profile}))
  }

}

function* updateUserProfile(action: PayloadAction<{data?: Partial<UserProfile>, 
  file?: FormData, resolve?: () => void, reject?: (error: unknown) => void}>){
  try {
    const profileApi = ProfileApiFactory();
    const profilePayload = (action.payload.data ?? {}) as UserProfile;

    if (action.payload.file) {
      yield put(setProfileImageUploading(true));
    }

    const response = (yield call(
      { context: profileApi, fn: profileApi.putUpdateProfile },
      profilePayload,
      { data: action.payload.file || undefined }
    )) as AxiosResponse<{message: string}>;
    //console.log(response?.data.message)
    let userId: string = yield appSelect(state => state.user.id);
    const profile = ((yield call(ProfileApiFactory().getUserProfile, userId)) as AxiosResponse<UserProfile>).data as UserProfile;
    yield put(setName(profile.username));
    yield put(storeUserDataAction({id: userId, profile: profile}));

    if (action.payload.resolve) {
      action.payload.resolve();
    }
  }
  catch (error) {
    console.error('failed to upload media', error);

    if (action.payload.reject) {
      action.payload.reject(error);
    }
  }
  finally {
    if (action.payload.file) {
      yield put(setProfileImageUploading(false));
    }
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
/**Auth Api saga */
  yield takeEvery(logInAction.type, handleLoginRequest);
  // Keep only one bootstrap refresh in-flight to avoid overlapping loading states.
  yield takeLatest(attemptRefreshFromLocalStorageAction.type, refreshFromLocalStorage);
  yield takeEvery(signupAction.type, handleSignupRequest);
  yield takeEvery(setUserPassword.type, handlePasswordChange);
  yield takeEvery(setDeleteConfirmation.type, handleDeleteAccount);
  yield takeEvery(logoutAction.type, handleLogout);
/**BlogPost APi saga */  
  yield takeEvery(fetchBlogPosts.type, handleGetBlogPost);
  yield takeEvery(fetchOneBlogPost.type, handleGetOneBlogPost);
/**Chat Api saga */
  yield takeEvery(fetchChatMessages.type, handleGetMessages);
  yield takeEvery(sendChatMessage.type, handlePostSendMessage);
  yield takeEvery(markChatOpened.type, updateChatOpened);
  yield takeEvery(fetchFriendList.type, handleGetFriendList);
/**Chatbot Api saga */
  yield takeEvery(sendChatbotMessage.type, handleSendChatbotMessage);
/**Events APi saga */  
  yield takeEvery(fetchAllEvents.type, handleGetEventsList);
  yield takeEvery(fetchUserEvents.type, handleGetAttendingEvents);  
  yield takeEvery(addAttendeeToEvent.type, handleAddAttendeeToEvent);
  yield takeEvery(removeAttendeeFromEvent.type, handleRemoveAttendeeFromEvent);
  yield takeEvery(fetchProfessionals.type, handleFetchProfessionals);
  yield takeEvery(fetchOneEvent.type, handleGetOneEvent);
/**Feed Api saga */
  yield takeEvery(updatePostsForFeedAction.type, updateFeed);
  yield takeEvery(postNewPostAction.type, postNewPost);
  yield takeEvery(postComment.type, postNewComment);
  yield takeEvery(retrievePostReactions.type, fetchPostReactions);
  yield takeEvery(postReactionToPost.type, handleReactionToPost);
  yield takeEvery(postLikePost.type, handleLikePost);
  yield takeEvery(fetchFollowedUsers.type, handleGetFollowing);
  yield takeEvery(SendFollowUser.type, handlePostFollowUser);
  yield takeEvery(retrieveOnePost.type, handleGetOnePost);
/**Media Api saga */
  yield takeEvery(fetchMediaItems.type, handleGetUserMediaItems);
  yield takeEvery(uploadMedia.type, handleUploadMedia);
  yield takeEvery(uploadBulkMedia.type, handleUploadBulkMedia);
/**Notification Api saga */
  yield takeEvery(fetchUserNotifications.type, handleGetUserNotifications);
  yield takeEvery(markNotificationRead.type, updateNotificationOpened);
  yield takeEvery(fetchNotificationPreferences.type, handleGetNotificationPreferences);
  yield takeEvery(updateNotificationPreferences.type, handleUpdateNotificationPreferences);
/**Profile Api saga */
  yield takeEvery(fetchUserDataAction.type, fetchUserProfileData);
  yield takeEvery(persistUserInfoAction.type, saveProfileInfoEffect);
  yield takeEvery(updateProfile.type, updateUserProfile);
  yield takeEvery(getEmailNotificationSettings.type, fetchEmailNotificationSettings);
  yield takeEvery(updateEmailNotificationSettings.type, updateEmailSettings);
  yield takeEvery(getProfileVisibilitySettings.type, fetchProfileVisiblitySettings);
  yield takeEvery(updateProfileVisibilitySettings.type, updateProfileSettings);
}

export default appSaga;
