import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const getHelpSlice = createSlice({
    name: "getHelp",
    initialState: {
        view: { activeTab: "Professionals" },
    },
    reducers: {
        setActiveGetHelpTabAction: (state, action: PayloadAction<string>) => {
            state.view.activeTab = action.payload;
        },
    }
})

export const {
    setActiveGetHelpTabAction
} = getHelpSlice.actions;
export default getHelpSlice.reducer;