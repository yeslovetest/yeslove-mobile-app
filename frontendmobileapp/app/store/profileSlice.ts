import { UserProfile, EmailNotification, EmailNotificationSettings, 
        ProfileVisibility, ProfileVisibilitySettings } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profiles: {} as Record<string, UserProfile>,
    view: { activeTab: "Timeline", activeAboutTab: "View"},
    settings: { emailNotificationSettings: [] as EmailNotification[], 
                profileVisibilitySettings: [] as ProfileVisibility[],
                 DefaultValue: true },

  }, //defines initial state
  reducers: {
    setProfileInformationAction: (
      state,
      action: PayloadAction<{id: string, data: UserProfile}>
    ) => {
      state.profiles[action.payload.id] = action.payload.data;
    },
    setActiveTabAction: (state, action: PayloadAction<string>) => {
      state.view.activeTab = action.payload;
    },
    setActiveAboutTabAction: (state, action: PayloadAction<string>) => {
      state.view.activeAboutTab = action.payload;
    },
    persistUserInfoAction: (state, action: PayloadAction<void>) => {},
    fetchUserDataAction: (state, action: PayloadAction<{id: string}>) => {},
    storeUserDataAction: (state, action: PayloadAction<{id: string, profile: UserProfile}>)=>{
      state.profiles[action.payload.id] = action.payload.profile;
    },
    getEmailNotificationSettings: (state, action: PayloadAction<void>) => {},
    setEmailNotificationSettings: (state, action: PayloadAction<EmailNotification[]>) => {
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
    setProfileVisibilitySettings: (state, action: PayloadAction<ProfileVisibility[]>) => {
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

  },
});

export const {
  setProfileInformationAction,
  setActiveAboutTabAction,
  setActiveTabAction,
  persistUserInfoAction,
  fetchUserDataAction,
  storeUserDataAction, 
  setEmailNotificationSettings,
  setEmailNotification,
  getEmailNotificationSettings,
  updateEmailNotificationSettings,
  getProfileVisibilitySettings,
  setProfileVisibilitySettings,
  setProfileVisibility,
  updateProfileVisibilitySettings
} = profileSlice.actions;
export default profileSlice.reducer;
