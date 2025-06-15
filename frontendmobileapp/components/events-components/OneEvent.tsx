import React from 'react'
import { useAppDispatch } from "@/app/store/hooks"
import { openTabOnTopAction, TabType } from "@/app/store/navigationSlice"
import styles from "@/Styles/page-styles/EventsStyles"
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import eventPlaceholders, { Event } from "./placeholderEvents";

export interface Props {
    event: Event
}

const OneEvent = (props: Props) => {

    const dispatch = useAppDispatch()

    const handleEventClick = () => {
        dispatch(openTabOnTopAction({ type: TabType.INDIVIDUAL_EVENT }))
    }

  return (
    <View>
        <View style={styles.eventsContainer}>
    <View style={styles.eventContainer}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>{props.event.date}</Text>
                        <Text style={styles.yearText}>{props.event.year}</Text>
                    </View>
                    <ImageBackground style={styles.eventImg} imageStyle={{ borderRadius: 10 }} source={props.event.image}>
                        <View style={styles.overlay}>
                            <TouchableOpacity onPress={handleEventClick}>
                                <Text style={styles.eventName}>{props.event.name}</Text>
                            </TouchableOpacity>
                            <Text style={styles.eventLocation}>{props.event.location}</Text>
                        </View>
                    </ImageBackground>
                </View>
                 </View>
                 </View>
  )
}

export default OneEvent
