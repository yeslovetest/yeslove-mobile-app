import { ChatMessage } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        messages: [] as ChatMessage[],
    },
    reducers: {
        fetchChatMessages: (state, action: PayloadAction<number>) => {},
        setChatMessages: (state, action: PayloadAction<ChatMessage[]>) => {
            state.messages = action.payload
        }
    }    
})

export const {
    fetchChatMessages, setChatMessages
} = chatSlice.actions;

export default chatSlice.reducer;