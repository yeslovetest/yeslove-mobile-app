import { NotificationListResponse, Notification } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: " notification",
    initialState: {
        allNotifications: [] as Notification[],
        currentPage: 1,
        perPage: 20,
        totalNotifications: 0,
        unreadNotifications: 0,
        notificationPreferences: {
            posts: true,
            likes: true,
            comments: true,
            events: true,
            blogs: true,
        }, // example preferences
    },
    reducers: {
        fetchUserNotifications: (state, action: PayloadAction<{perPage?: number, currentPage?: number}>) => {},
        setUserNotification: (state, action: PayloadAction<NotificationListResponse>) => {
            state.allNotifications = action.payload.notifications || [];
            state.currentPage = action.payload.current_page || 1;
            state.perPage = action.payload.per_page || 20;
            state.totalNotifications = action.payload.total || 0;
            state.unreadNotifications = action.payload.unread || 0;
        },
        markNotificationRead: (state, action: PayloadAction<number>) => {},
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
    fetchNotificationPreferences, setNotificationPreferences, updateNotificationPreferences, 
    changeNotificationPreference
} = notificationSlice.actions;

export default notificationSlice.reducer;