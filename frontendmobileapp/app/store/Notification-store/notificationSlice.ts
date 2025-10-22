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
    }    
})

export const {
    fetchUserNotifications, setUserNotification, markNotificationRead
} = notificationSlice.actions;

export default notificationSlice.reducer;