import { View, ImageBackground, Pressable, Text } from "react-native";
import React, { useState } from 'react'
import { Event } from '../../../Events-root/Events-root-components/Events-list/placeholderEvents';
import styles from "./EventsInfoHeaderStyles";
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import AntDesign from '@expo/vector-icons/AntDesign';
import { addAttendeeToEvent, removeAttendeeFromEvent } from "@/app/store/Events-store/eventsSlice";
import { EventsModelResponse, EventListResponse } from "@/generated-api";

const EventsInfoHeader = () => {
  const dispatch = useAppDispatch();
  const [isAttending, setIsAttending] = useState(false)

  const toggleAttending = () => {
    setIsAttending(prev => !prev);

    //dispatch(addAttendeeToEvent(2));
    //dispatch(removeAttendeeFromEvent(2)); 
  };

  const event: EventsModelResponse = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as EventsModelResponse;

  return (
    <View>
      <View style={styles.indEventContainer}>
              <ImageBackground style={styles.indEventImg} source={event.image_url ?? ''} >
                <Pressable onPress={toggleAttending} style={styles.favouriteContainer}>
                      {isAttending ? (
                    <><Text style={styles.addToEventText}>Attending ✔️</Text></>
                  ) : (
                    <><Text style={styles.addToEventText}>Add Event ➕</Text></>
                  )}
                </Pressable>
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
