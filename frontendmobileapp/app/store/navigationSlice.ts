import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum TabType {
  HOME = "HOME",
  GET_HELP = "GET_HELP",
  EVENTS = "EVENTS",
  PROFILE = "PROFILE",
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
