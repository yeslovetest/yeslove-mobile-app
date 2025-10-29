import { Chat, FriendInfo } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",     // Slice for messaging and chatbot
    initialState: {
        messages: [] as Chat[],
        friends: [] as FriendInfo[],
        chatbotResponse: "",
    },
    reducers: {
        fetchChatMessages: (state, action: PayloadAction<string>) => {},
        setChatMessages: (state, action: PayloadAction<Chat[]>) => {
            state.messages = action.payload
        },
        sendChatMessage: (state, action: PayloadAction<{id: string, message: string}>) => {},
        markChatOpened: (state, action: PayloadAction<string>) => {},
        fetchFriendList: (state, action: PayloadAction<string>) => {},
        setFriendList: (state, action: PayloadAction<FriendInfo[]>) => {
            state.friends = action.payload
        },
        sendChatbotMessage: (state, action: PayloadAction<{prompt: string}>) => {},
        setChatbotResponse: (state, action: PayloadAction<string>) => {
            state.chatbotResponse = action.payload
        },
    }    
})

export const {
    fetchChatMessages, setChatMessages, sendChatMessage, 
    markChatOpened, fetchFriendList, setFriendList,
    sendChatbotMessage, setChatbotResponse
} = chatSlice.actions;

export default chatSlice.reducer;