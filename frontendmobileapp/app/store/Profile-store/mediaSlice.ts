import { MediaFile } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UploadMediaPayload = {
  requestBody: FormData;
  resolve?: (ids: string[]) => void;
  reject?: (error: unknown) => void;
};

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
    uploadMedia: (state, action: PayloadAction<UploadMediaPayload>) => {},
    uploadBulkMedia: (state, action: PayloadAction<UploadMediaPayload>) => {},
    setUploadedMediaId: (state, action: PayloadAction<string[]>) => {
      state.uploadedMediaId = action.payload;
    },
  },
});

export const { fetchMediaItems, setMediaItems, uploadMedia, setUploadedMediaId, uploadBulkMedia } =
  mediaSlice.actions;
export default mediaSlice.reducer;
