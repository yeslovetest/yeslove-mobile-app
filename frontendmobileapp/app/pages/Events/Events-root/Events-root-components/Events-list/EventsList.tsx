import React from "react";
import { View } from "react-native";
import OneEvent from "../One-event/OneEvent";
import styles from "./EventsListStyles";
import { useAppSelector } from '@/app/store/hooks';


export interface Props {
    eventType?: 'upcoming' | 'attending' | 'attended';
}

const EventsList = (props: Props) => {

    const allEvents = useAppSelector(state => state.events.allEvents.events ?? []);
    const userEvents = useAppSelector(state => state.events.userEvents.events ?? []);
    const events = props.eventType === "upcoming" ? allEvents : userEvents;  

    return (
        <View style={styles.eventsContainer}>
            {events.map((event, index) => (
                <OneEvent event={event} key={index}/>
            ))}
        </View>
    );
}

export default EventsList
