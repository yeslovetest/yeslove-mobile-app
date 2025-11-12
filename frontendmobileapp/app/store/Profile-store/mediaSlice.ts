import { MediaFile } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const mediaSlice = createSlice({
    name: "media",
    initialState: { 
        mediaList: [] as MediaFile[], 
        uploadedMediaId: null as string[] | null,
    }, //defines initial state
    reducers: {
        fetchMediaItems: (state, action: PayloadAction<number>) => {},
        setMediaItems: (state, action: PayloadAction<MediaFile[]>) => {
            state.mediaList = action.payload; 
        },
        uploadMedia: (state, action: PayloadAction<{requestBody: FormData}>) => {},
        uploadBulkMedia: (state, action: PayloadAction<{requestBody: FormData}>) => {},
        setUploadedMediaId: (state, action: PayloadAction<string[]>) => {
            state.uploadedMediaId = action.payload;
        },

    },
})

export const { fetchMediaItems, setMediaItems, uploadMedia, setUploadedMediaId, uploadBulkMedia } = mediaSlice.actions; 
export default mediaSlice.reducer;