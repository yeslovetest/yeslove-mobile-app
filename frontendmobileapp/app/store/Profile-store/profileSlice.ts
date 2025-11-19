import { UserProfile, EmailNotificationSetting, EmailNotificationSettings, 
        ProfileVisibilitySetting, ProfileVisibilitySettings } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useAppSelector } from "../hooks";

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

  }, //defines initial state
  reducers: {
    setProfileInformationAction: (
      state,
      action: PayloadAction<{id: string, data: UserProfile}>
    ) => {
      state.profiles[action.payload.id] = action.payload.data;
    },
    updateProfile: (state, action: PayloadAction<{data?: Partial<UserProfile>, 
      file?: FormData }>) => {},
    setActiveTabAction: (state, action: PayloadAction<string>) => {
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
  setUserProfileState
} = profileSlice.actions;
export default profileSlice.reducer;
