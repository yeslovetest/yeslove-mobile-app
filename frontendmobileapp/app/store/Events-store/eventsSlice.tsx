import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EventsModelResponse, EventListResponse } from "@/generated-api";

const eventSlice = createSlice({
    name: "events",
    initialState: {
        view: { activeTab: "Upcoming" },
        allEvents: {events: [] as EventsModelResponse[],
            totalEvents: 0,
            eventPage: 1,
            eventsPerPage: 10,
        },
        userEvents:{events: [] as EventsModelResponse[],
            totalEvents: 0,
            eventPage: 1,
            eventsPerPage: 10,
        },
        oneEvent: {} as EventsModelResponse | undefined,
        
    },
    reducers: {
        setActiveEventsTabAction: (state, action: PayloadAction<string>) => {
            state.view.activeTab = action.payload;
        },
        fetchAllEvents: (state, action: PayloadAction<{endDate?: string, startDate?: string, perPage?: number, currentPage?: number}>) => {},
        setAllEvents: (state, action:PayloadAction<{events: EventListResponse}>) => {
            state.allEvents.events = action.payload.events.items || []; 
            state.allEvents.totalEvents = action.payload.events.total || 0;
            state.allEvents.eventPage = action.payload.events.page || 1;
            state.allEvents.eventsPerPage = action.payload.events.per_page || 10;
                        
        },
        fetchUserEvents: (state, action: PayloadAction<{queryType: string , endDate?: string, startDate?: string, perPage?: number, currentPage?: number}>) => {},
        setUserEvents: (state, action:PayloadAction<{events: EventListResponse}>) => {
            state.userEvents.events = action.payload.events.items || [];   
            state.userEvents.totalEvents = action.payload.events.total || 0;
            state.userEvents.eventPage = action.payload.events.page || 1;
            state.userEvents.eventsPerPage = action.payload.events.per_page || 10;          
        }, 
        addAttendeeToEvent: (state, action:PayloadAction<{eventId: number}>) => {},     
        removeAttendeeFromEvent: (state, action:PayloadAction<{eventId: number}>) => {},
        fetchOneEvent: (state, action:PayloadAction<{eventId: number}>) => {},     
        setOneEvent: (state, action:PayloadAction<EventsModelResponse | undefined>) => {
            state.oneEvent = action.payload;    
        },    
    }      
})

export const {
    setActiveEventsTabAction, fetchAllEvents, setAllEvents, 
    fetchUserEvents, setUserEvents, addAttendeeToEvent, removeAttendeeFromEvent,
    fetchOneEvent, setOneEvent
} = eventSlice.actions;
export default eventSlice.reducer;