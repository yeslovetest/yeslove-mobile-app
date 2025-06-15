import { UserProfile } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profiles: {} as Record<string, UserProfile>,
    view: { activeTab: "Timeline", activeAboutTab: "View"},
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
    }
  },
});

export const {
  setProfileInformationAction,
  setActiveAboutTabAction,
  setActiveTabAction,
  persistUserInfoAction,
  fetchUserDataAction,
  storeUserDataAction
} = profileSlice.actions;
export default profileSlice.reducer;
