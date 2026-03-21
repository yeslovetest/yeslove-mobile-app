import { View, ImageBackground, Pressable, Text } from "react-native";
import React, { useState } from 'react'
import styles from "./EventsInfoHeaderStyles";
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { addAttendeeToEvent, removeAttendeeFromEvent } from "@/app/store/Events-store/eventsSlice";
import { EventsModelResponse } from "@/generated-api";
import dayjs from 'dayjs';

const EventsInfoHeader = () => {
  const dispatch = useAppDispatch();
  const event: EventsModelResponse = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as EventsModelResponse;
  const [isAttending, setIsAttending] = useState(event.is_attending);

  const toggleAttending = (status: boolean | undefined) => {
    if (status) {
      dispatch(removeAttendeeFromEvent({eventId: event.id ?? 0}));
    }
    else {  
      dispatch(addAttendeeToEvent({eventId: event.id ?? 0}));
    } 
    setIsAttending(prev => !prev);
  };

  // Compare if the event is in the future
  const isFuture = dayjs(event.event_time).isAfter(dayjs());
  console.log(event)

  return (
    <View>
      <View style={styles.indEventContainer}>
              <ImageBackground style={styles.indEventImg} source={event.image_url ?? ''} >
                {isFuture && (
                  <Pressable onPress={() => toggleAttending(isAttending)} style={styles.favouriteContainer}>
                  {isAttending ? (
                    <><Text style={styles.addToEventText}>Attending ✔️</Text></>
                  ) : (
                    <><Text style={styles.addToEventText}>Add Event ➕</Text></>
                  )}
                </Pressable>
                )}
                <View style={styles.overlayInd}>
                <Text style={styles.eventNameInd}>{event.name}</Text>
                <Text style={styles.eventLocationInd}>{event.location}</Text>
                </View>
              </ImageBackground>
              </View>
    </View>
  )
}

export default EventsInfoHeader
