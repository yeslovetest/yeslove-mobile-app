import { Chat } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        messages: [] as Chat[],
    },
    reducers: {
        fetchChatMessages: (state, action: PayloadAction<string>) => {},
        setChatMessages: (state, action: PayloadAction<Chat[]>) => {
            state.messages = action.payload
        },
        sendChatMessage: (state, action: PayloadAction<{id: string, message: string}>) => {}
    }    
})

export const {
    fetchChatMessages, setChatMessages, sendChatMessage
} = chatSlice.actions;

export default chatSlice.reducer;