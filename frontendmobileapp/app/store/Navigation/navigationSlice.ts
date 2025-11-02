import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum TabType {
  HOME = "HOME",
  GET_HELP = "GET_HELP",
  EVENTS = "EVENTS",
  PROFILE = "PROFILE",
  SETTINGS = "SETTINGS",
  EDIT_PROFILE_INFORMATION = "EDIT_PROFILE_INFORMATION",
  PROFILE_INFORMATION = "PROFILE_INFORMATION",
  /*settings folders pages */
     GENERAL = "GENERAL",
     EMAIL = "EMAIL",
     PROFILE_VISIBILITY = "PROFILE_VISIBILITY",
    NOTIFICATION_PREFERENCES = "NOTIFICATION_PREFERENCES",
     EXPORT_DATA = "EXPORT_DATA",
  NOTIFICATIONS = "NOTIFICATIONS", 
     MESSAGES = "MESSAGES",
        CONVERSATION = "CONVERSATION",
           CHATBOT = "CHATBOT",
  INDIVIDUAL_EVENT = "INDIVIDUAL_EVENT",
  INDIVIDUAL_BLOG = "INDIVIDUAL_BLOG",
  INDIVIDUAL_POST = "INDIVIDUAL_POST",
}

export class TabData {
  type?: TabType;
  data?: Record<string, any>;
}

const navigationSlice = createSlice({
  name: "navigation",
  initialState: { tabStack: [{ type: TabType.HOME, data: {} } as TabData] }, //defines initial state
  reducers: {
    changeTabAction: (state, action: PayloadAction<TabData>) => {
      state.tabStack = [action.payload];
    },
    openTabOnTopAction: (state, action: PayloadAction<TabData>) => {
      state.tabStack = state.tabStack.concat([action.payload]);
    },
    goBackToPreviousTabAction: (state, action: PayloadAction<void>) => {
      state.tabStack.splice(-1);
    },
  },
});

export const {
  changeTabAction,
  openTabOnTopAction,
  goBackToPreviousTabAction,
} = navigationSlice.actions;
export const navigationReducer = navigationSlice.reducer;

export default navigationSlice.reducer;
