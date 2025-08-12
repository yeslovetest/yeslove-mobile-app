import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const eventSlice = createSlice({
    name: "events",
    initialState: {
        view: { activeTab: "Upcoming" },
    },
    reducers: {
        setActiveEventsTabAction: (state, action: PayloadAction<string>) => {
            state.view.activeTab = action.payload;
        },
    }
})

export const {
    setActiveEventsTabAction
} = eventSlice.actions;
export default eventSlice.reducer;