import { useAppDispatch } from "@/app/store/hooks"
import { openTabOnTopAction, TabType } from "@/app/store/Navigation/navigationSlice"
import styles from "./OneEventStyles";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import eventPlaceholders, { Event } from "../Events-list/placeholderEvents";
import { EventsModelResponse, EventListResponse } from "@/generated-api";
import dayjs from 'dayjs';

export interface Props {
    event: EventsModelResponse
}

const OneEvent = (props: Props) => {

    const dispatch = useAppDispatch()

    const handleEventClick = () => {
        dispatch(openTabOnTopAction({ type: TabType.INDIVIDUAL_EVENT, data: props.event}))
    }

  return (
    <View>
        <TouchableOpacity onPress={handleEventClick} activeOpacity={0.7}>
        <View style={styles.eventsContainer}>
            
                <View style={styles.eventContainer}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>{dayjs(props.event?.event_time).format('MMM D')}</Text>
                        <Text style={styles.yearText}>{dayjs(props.event?.event_time).format('YYYY')}</Text>
                    </View>
                    <ImageBackground style={styles.eventImg} imageStyle={{ borderRadius: 10 }} source={props.event?.image_url ?? ''}>
                        <View style={styles.overlay}>
                            
                                <Text style={styles.eventName}>{props.event?.name}</Text>
                        
                            <Text style={styles.eventLocation}>{props.event?.location}</Text>
                        </View>
                    </ImageBackground>
                </View>
            
        </View>
        </TouchableOpacity>
    </View>
  )
}

export default OneEvent
