import { NotificationListResponse, Notification } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FriendRequestItem {
    keycloak_id: string;
    username: string;
    image?: string;
}

const notificationSlice = createSlice({
    name: " notification",
    initialState: {
        scrollViewPosition: 0,   //default initial value
        allNotifications: [] as Notification[],
        currentPage: 1,
        perPage: 20,
        totalNotifications: 0,
        unreadNotifications: 0,
        activeFriendRequests: [] as FriendRequestItem[],
        notificationPreferences: {
            posts: true,
            likes: true,
            comments: true,
            events: true,
            blogs: true,
        }, // example preferences
    },
    reducers: {
        setScrollViewPosition: (state, action: PayloadAction<number>) => {
            state.scrollViewPosition = action.payload;
        },
        fetchUserNotifications: (state, action: PayloadAction<{perPage?: number, currentPage?: number}>) => {},
        setUserNotification: (state, action: PayloadAction<NotificationListResponse>) => {
            const page = action.payload.current_page ?? 1;
            const notifications = action.payload.notifications ?? [];

            if (page === 1){
                state.allNotifications = notifications;
            }
            else if (page > 1){
                state.allNotifications = state.allNotifications.concat(notifications)
            }
            state.currentPage = page;
            state.perPage = action.payload.per_page || 20;
            state.totalNotifications = action.payload.total || 0;
            state.unreadNotifications = action.payload.unread || 0;
        },
        markNotificationRead: (state, action: PayloadAction<number>) => {},
        fetchFriendRequests: (state) => {},
        setFriendRequests: (state, action: PayloadAction<FriendRequestItem[]>) => {
            state.activeFriendRequests = action.payload;
        },
        respondToFriendRequest: (state, action: PayloadAction<{keycloakId: string, decision: 'accept' | 'decline'}>) => {},
        fetchNotificationPreferences: (state) => {},
        setNotificationPreferences: (state, action: PayloadAction<typeof state.notificationPreferences>) => {
            state.notificationPreferences = action.payload;
        },
        changeNotificationPreference: (state, action: PayloadAction<{key: string}>) => {
            const { key } = action.payload;
            (state.notificationPreferences as any)[key] = !(state.notificationPreferences as any)[key];
        },
        updateNotificationPreferences: (state, action: PayloadAction<{preferences: typeof state.notificationPreferences}>) => {},  
    }    
})

export const {
    fetchUserNotifications, setUserNotification, markNotificationRead, 
    fetchFriendRequests, setFriendRequests, respondToFriendRequest,
    fetchNotificationPreferences, setNotificationPreferences, updateNotificationPreferences, 
    changeNotificationPreference, setScrollViewPosition
} = notificationSlice.actions;

export default notificationSlice.reducer;