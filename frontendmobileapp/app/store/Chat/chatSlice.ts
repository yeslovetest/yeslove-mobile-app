import { Chat, FriendInfo } from "@/generated-api";
import { ChatResponse as chatbotApiResponse } from "@/chatbot-client-api/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ChatOutboundMediaFile = {
    uri: string;
    type: string;
    name?: string;
};

export type SendChatMessagePayload = {
    id: string;
    message: string;
    mediaFiles?: ChatOutboundMediaFile[] | undefined;
};

type SendMessageStatus = 'idle' | 'sending' | 'succeeded' | 'failed';

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
            sources: '',
            updated_at: 0,
        },
        mediaData: { mediaFormData: null as FormData | null },
        sendMessageStatus: 'idle' as SendMessageStatus,
        sendMessageError: '' as string,
    },
    reducers: {
        fetchChatMessages: (state, action: PayloadAction<string>) => {},
        setChatMessages: (state, action: PayloadAction<Chat[]>) => {
            state.messages = action.payload
        },
        sendChatMessage: (state, action: PayloadAction<SendChatMessagePayload>) => {},
        sendChatMessageStarted: (state) => {
            state.sendMessageStatus = 'sending';
            state.sendMessageError = '';
        },
        sendChatMessageSucceeded: (state) => {
            state.sendMessageStatus = 'succeeded';
            state.sendMessageError = '';
        },
        sendChatMessageFailed: (state, action: PayloadAction<string>) => {
            state.sendMessageStatus = 'failed';
            state.sendMessageError = action.payload;
        },
        resetSendChatMessageStatus: (state) => {
            state.sendMessageStatus = 'idle';
            state.sendMessageError = '';
        },
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
                state.chatbotResponse.response = String(action.payload.response ?? '');
                state.chatbotResponse.user_id = String(action.payload.user_id ?? '');
                state.chatbotResponse.session_id = String(action.payload.session_id ?? '');
                state.chatbotResponse.sources = String(action.payload.sources ?? '');
                state.chatbotResponse.updated_at = Date.now();
            } else {
                state.chatbotResponse = {
                    response: '',
                    user_id: '',
                    session_id: '',
                    sources: '',
                    updated_at: Date.now(),
                };
            }
        },
    }    
})

export const {
    fetchChatMessages, setChatMessages, sendChatMessage, 
    sendChatMessageStarted, sendChatMessageSucceeded, sendChatMessageFailed, resetSendChatMessageStatus,
    markChatOpened, fetchFriendList, setFriendList,
    sendChatbotMessage, setChatbotResponse, setMediaFormData, setMessagesScrollViewPosition
} = chatSlice.actions;

export default chatSlice.reducer;