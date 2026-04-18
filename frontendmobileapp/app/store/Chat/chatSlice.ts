import { Chat, FriendInfo } from "@/generated-api";
import { ChatResponse as chatbotApiResponse } from "@/chatbot-client-api/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ChatOutboundMediaFile = {
    uri: string;
    type: string;
    name?: string;
};

const chatSlice = createSlice({
    name: "chat",     // Slice for messaging and chatbot
    initialState: {
        messages: [] as Chat[],
        friends: [] as FriendInfo[],
        messagesScrollViewPosition: 0,
        chatbotResponse: {
            response: '',
            user_id: '',
            session_id: '',
            sources: ''
        },
        mediaData: { mediaFormData: null as FormData | null },
    },
    reducers: {
        fetchChatMessages: (state, action: PayloadAction<string>) => {},
        setChatMessages: (state, action: PayloadAction<Chat[]>) => {
            state.messages = action.payload
        },
        sendChatMessage: (state, action: PayloadAction<{id: string, message: string, mediaFiles?: ChatOutboundMediaFile[] | undefined}>) => {},
        setMediaFormData: (state, action: PayloadAction<{ mediaFormData: FormData | null}>) => {
            state.mediaData.mediaFormData = action.payload.mediaFormData
        },
        markChatOpened: (state, action: PayloadAction<string>) => {},
        fetchFriendList: (state, action: PayloadAction<string>) => {},
        setFriendList: (state, action: PayloadAction<FriendInfo[]>) => {
            state.friends = action.payload
        },
        setMessagesScrollViewPosition: (state, action: PayloadAction<number>) => {
            state.messagesScrollViewPosition = action.payload;
        },
        sendChatbotMessage: (state, action: PayloadAction<{prompt: string}>) => {},
        setChatbotResponse: (state, action: PayloadAction<chatbotApiResponse | null>) => {
            if (action.payload) {
                state.chatbotResponse.response = action.payload.response;
                state.chatbotResponse.user_id = action.payload.user_id;
                state.chatbotResponse.session_id = action.payload.session_id;
                state.chatbotResponse.sources = action.payload.sources;
            } else {
                state.chatbotResponse = {
                    response: '',
                    user_id: '',
                    session_id: '',
                    sources: ''
                };
            }
        },
    }    
})

export const {
    fetchChatMessages, setChatMessages, sendChatMessage, 
    markChatOpened, fetchFriendList, setFriendList,
    sendChatbotMessage, setChatbotResponse, setMediaFormData, setMessagesScrollViewPosition
} = chatSlice.actions;

export default chatSlice.reducer;