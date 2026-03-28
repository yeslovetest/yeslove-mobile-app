import React from 'react';
import { useAppDispatch } from "@/app/store/hooks"
import { openTabOnTopAction, TabType } from "@/app/store/Navigation/navigationSlice"
import styles from "./OneEventStyles";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { EventsModelResponse } from "@/generated-api";
import defaultEventImg from "@/assets/images/eventimg1.jpg"
import dayjs from 'dayjs';

export interface Props {
    event: EventsModelResponse
}

const OneEvent = (props: Props) => {
    const [useFallbackImage, setUseFallbackImage] = React.useState(false);

    const dispatch = useAppDispatch()
    const imageUrl = typeof props.event?.image_url === 'string' ? props.event.image_url.trim() : '';
    const hasRemoteImage = /^https?:\/\//i.test(imageUrl);
    const eventImageSource = hasRemoteImage && !useFallbackImage ? { uri: imageUrl } : defaultEventImg;

    const handleEventClick = () => {
        dispatch(openTabOnTopAction({ type: TabType.INDIVIDUAL_EVENT, data: props.event}))
    }

  return (
    <TouchableOpacity style={[styles.eventsContainer, styles.eventContainer]} onPress={handleEventClick} activeOpacity={0.7}>
            <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{dayjs(props.event?.event_time).format('MMM D')}</Text>
                <Text style={styles.yearText}>{dayjs(props.event?.event_time).format('YYYY')}</Text>
            </View>
            <ImageBackground
                style={styles.eventImg}
                imageStyle={styles.eventImageStyle}
                source={eventImageSource}
                resizeMode="cover"
                onError={() => setUseFallbackImage(true)}
            >
                <View style={styles.overlay}>
                    <View style={styles.eventTextBlock}>
                        <Text style={styles.eventName} numberOfLines={2}>{props.event?.name}</Text>
                        <Text style={styles.eventLocation} numberOfLines={1}>{props.event?.location}</Text>
                    </View>
                </View>
            </ImageBackground>
    </TouchableOpacity>
  )
}

export default OneEvent
