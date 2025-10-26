import { MediaFile } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const mediaSlice = createSlice({
    name: "media",
    initialState: { 
        mediaList: [] as MediaFile[], 
    }, //defines initial state
    reducers: {
        fetchMediaItems: (state, action: PayloadAction<number>) => {},
        setMediaItems: (state, action: PayloadAction<MediaFile[]>) => {
            state.mediaList = action.payload; 
        },
    },
})

export const { fetchMediaItems, setMediaItems } = mediaSlice.actions; 
export default mediaSlice.reducer;