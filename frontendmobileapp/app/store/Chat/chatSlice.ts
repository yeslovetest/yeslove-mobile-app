import { Chat, FriendInfo } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        messages: [] as Chat[],
        friends: [] as FriendInfo[]
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
        }
    }    
})

export const {
    fetchChatMessages, setChatMessages, sendChatMessage, 
    markChatOpened, fetchFriendList, setFriendList
} = chatSlice.actions;

export default chatSlice.reducer;