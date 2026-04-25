import { UserProfile, EmailNotificationSetting, EmailNotificationSettings, 
  ProfileVisibilitySetting, ProfileVisibilitySettings, UserPost } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useAppSelector } from "../hooks";

type TimelineState = {
  posts: UserPost[];
  total: number;
  perPage: number;
  currentPage: number;
  hasMore: boolean;
  loading: boolean;
  fetchingMore: boolean;
  keycloakId: string;
  initialized: boolean;
  error?: string;
};

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profiles: {} as Record<string, UserProfile>,
    view: { activeTab: "Timeline", activeAboutTab: "View"},
    settings: { emailNotificationSettings: [] as EmailNotificationSetting[], 
                profileVisibilitySettings: [] as ProfileVisibilitySetting[],
                 DefaultValue: true },
    profilePicData: null as FormData | null , 
    loadingScreenActive: false,
    isCurrentUserProfile: false, //default value            
    isProfileImageUploading: false,
    timeline: {
      posts: [],
      total: 0,
      perPage: 10,
      currentPage: 0,
      hasMore: true,
      loading: false,
      fetchingMore: false,
      keycloakId: "",
      initialized: false,
      error: undefined,
    } as TimelineState,

  }, //defines initial state
  reducers: {
    setProfileInformationAction: (
      state,
      action: PayloadAction<{id: string, data: UserProfile}>
    ) => {
      state.profiles[action.payload.id] = action.payload.data;
    },
    : (state, action: PayloadAction<{data?: Partial<UserProfile>, 
      file?: FormData, resolve?: () => void, reject?: (error: unknown) => void }>) => {},
    setActiveTabAction: (state, action: PayloadAction<string>) => {updateProfile
      state.view.activeTab = action.payload;
    },
    setActiveAboutTabAction: (state, action: PayloadAction<string>) => {
      state.view.activeAboutTab = action.payload;
    },
    persistUserInfoAction: (state, action: PayloadAction<void>) => {},
    fetchUserDataAction: (state, action: PayloadAction<{id: string, isCurrentUser: boolean}>) => {},
    storeUserDataAction: (state, action: PayloadAction<{id: string, profile: UserProfile}>)=>{
      state.profiles[action.payload.id] = action.payload.profile;
    },
    getEmailNotificationSettings: (state, action: PayloadAction<void>) => {},
    setEmailNotificationSettings: (state, action: PayloadAction<EmailNotificationSetting[]>) => {
      state.settings.emailNotificationSettings = action.payload;
    },   
    setEmailNotification: (state, action: PayloadAction<{id: number}>)  => {
      let settingsIndex = state.settings.emailNotificationSettings.findIndex(setting => {
        return setting.setting_id === String(action.payload.id);
      })
      if (settingsIndex !== -1) {
        state.settings.emailNotificationSettings[settingsIndex].value = !state.settings.emailNotificationSettings[settingsIndex].value;
      }
      else {
        state.settings.emailNotificationSettings.push({setting_id: String(action.payload.id), value: !state.settings.DefaultValue})
      }
    },
    updateEmailNotificationSettings: (state, action: PayloadAction<EmailNotificationSettings>) => {},
    getProfileVisibilitySettings: (state, action: PayloadAction<void>) => {},
    setProfileVisibilitySettings: (state, action: PayloadAction<ProfileVisibilitySetting[]>) => {
      state.settings.profileVisibilitySettings = action.payload;
    },   
    setProfileVisibility: (state, action: PayloadAction<{id: number, category: string}>)  => {
      let settingsIndex = state.settings.profileVisibilitySettings.findIndex(setting => {
        return setting.setting_id === String(action.payload.id);
      })
      if (settingsIndex !== -1) {
        if (state.settings.profileVisibilitySettings[settingsIndex].value === 'visible'){
          state.settings.profileVisibilitySettings[settingsIndex].value = 'hidden';
        } 
        else {
          state.settings.profileVisibilitySettings[settingsIndex].value = 'visible';
        }
      }
      else {
        state.settings.profileVisibilitySettings.push({setting_id: String(action.payload.id), 
          value: 'hidden', category: action.payload.category});
      }
    },
    updateProfileVisibilitySettings: (state, action: PayloadAction<ProfileVisibilitySettings>) => {},
    activateLoadingScreen: (state, action:PayloadAction<boolean>) => {
      state.loadingScreenActive = action.payload},
    setUserProfileState: (state, action: PayloadAction<boolean>) => {
      state.isCurrentUserProfile = action.payload
    },
    setProfileImageUploading: (state, action: PayloadAction<boolean>) => {
      state.isProfileImageUploading = action.payload;
    },
    fetchUserTimelineAction: (state, action: PayloadAction<{id: string, perPage?: number, page?: number, reset?: boolean}>) => {
      const isFirstPage = (action.payload.page ?? 1) <= 1;
      const reset = !!action.payload.reset || isFirstPage;

      if (reset) {
        state.timeline.loading = true;
        state.timeline.fetchingMore = false;
        state.timeline.error = undefined;
        state.timeline.posts = [];
        state.timeline.total = 0;
        state.timeline.currentPage = 0;
        state.timeline.hasMore = true;
        state.timeline.keycloakId = action.payload.id;
        state.timeline.initialized = false;
        if (action.payload.perPage) {
          state.timeline.perPage = action.payload.perPage;
        }
        return;
      }

      if (!state.timeline.loading && state.timeline.hasMore) {
        state.timeline.fetchingMore = true;
        state.timeline.error = undefined;
      }
    },
    fetchUserTimelineNextPageAction: (state, action: PayloadAction<{id: string, perPage?: number}>) => {
      if (state.timeline.loading || state.timeline.fetchingMore || !state.timeline.hasMore) {
        return;
      }

      if (state.timeline.keycloakId && state.timeline.keycloakId !== action.payload.id) {
        return;
      }

      if (action.payload.perPage) {
        state.timeline.perPage = action.payload.perPage;
      }

      state.timeline.fetchingMore = true;
      state.timeline.error = undefined;
    },
    setUserTimelineAction: (state, action: PayloadAction<{id: string, posts: UserPost[], total: number, perPage: number, currentPage: number}>) => {
      const shouldReset = action.payload.currentPage <= 1 || state.timeline.keycloakId !== action.payload.id;
      const existing = shouldReset ? [] : state.timeline.posts;
      const merged = [...existing, ...action.payload.posts];
      const uniquePosts = merged.filter((post, index, arr) => {
        const postId = post.id ?? -1;
        return arr.findIndex((item) => (item.id ?? -2) === postId) === index;
      });

      const hasMore = uniquePosts.length < action.payload.total;

      state.timeline.posts = uniquePosts;
      state.timeline.total = action.payload.total;
      state.timeline.perPage = action.payload.perPage;
      state.timeline.currentPage = action.payload.currentPage;
      state.timeline.hasMore = hasMore;
      state.timeline.loading = false;
      state.timeline.fetchingMore = false;
      state.timeline.keycloakId = action.payload.id;
      state.timeline.initialized = true;
      state.timeline.error = undefined;
    },
    setUserTimelineFailedAction: (state, action: PayloadAction<{message: string}>) => {
      state.timeline.loading = false;
      state.timeline.fetchingMore = false;
      state.timeline.error = action.payload.message;
      state.timeline.initialized = true;
    },
  },
});

export const {
  setProfileInformationAction,
  setActiveAboutTabAction,
  setActiveTabAction,
  persistUserInfoAction,
  fetchUserDataAction,
  storeUserDataAction, 
  updateProfile,
  setEmailNotificationSettings,
  setEmailNotification,
  getEmailNotificationSettings,
  updateEmailNotificationSettings,
  getProfileVisibilitySettings,
  setProfileVisibilitySettings,
  setProfileVisibility,
  updateProfileVisibilitySettings,
  activateLoadingScreen,
  setUserProfileState,
  setProfileImageUploading,
  fetchUserTimelineAction,
  fetchUserTimelineNextPageAction,
  setUserTimelineAction,
  setUserTimelineFailedAction,
} = profileSlice.actions;
export default profileSlice.reducer;
