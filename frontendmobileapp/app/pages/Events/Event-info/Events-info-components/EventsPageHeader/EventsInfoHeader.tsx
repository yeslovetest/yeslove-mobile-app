import { View, ImageBackground, Pressable, Text, Animated, Easing } from "react-native";
import React, { useState } from 'react'
import styles from "./EventsInfoHeaderStyles";
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { addAttendeeToEvent, removeAttendeeFromEvent } from "@/app/store/Events-store/eventsSlice";
import { EventsModelResponse } from "@/generated-api";
import defaultEventImg from "@/assets/images/eventimg1.jpg"
import dayjs from 'dayjs';

const EventsInfoHeader = () => {
  const dispatch = useAppDispatch();
  const event: EventsModelResponse = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as EventsModelResponse;
  const [isAttending, setIsAttending] = useState(event.is_attending);
  const [useFallbackImage, setUseFallbackImage] = useState(false);
  const addEventFlash = React.useRef(new Animated.Value(0)).current;

  const imageUrl = typeof event?.image_url === 'string' ? event.image_url.trim() : '';
  const hasRemoteImage = /^https?:\/\//i.test(imageUrl);
  const eventImageSource = hasRemoteImage && !useFallbackImage ? { uri: imageUrl } : defaultEventImg;

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

  React.useEffect(() => {
    if (!isFuture || isAttending) {
      addEventFlash.stopAnimation();
      addEventFlash.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(addEventFlash, {
          toValue: 1,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(addEventFlash, {
          toValue: 0,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
      addEventFlash.stopAnimation();
      addEventFlash.setValue(0);
    };
  }, [addEventFlash, isAttending, isFuture]);

  const addEventAnimatedStyle = {
    backgroundColor: addEventFlash.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(255, 255, 255, 0.92)', 'rgba(255, 232, 166, 0.98)'],
    }),
    transform: [
      {
        scale: addEventFlash.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.03],
        }),
      },
    ],
  };

  return (
    <View style={styles.indEventContainer}>
      <ImageBackground
        style={styles.indEventImg}
        imageStyle={styles.indEventImageStyle}
        source={eventImageSource}
        resizeMode="cover"
        onError={() => setUseFallbackImage(true)}
      >
        {isFuture && (
          <Animated.View style={[styles.favouriteContainer, !isAttending && addEventAnimatedStyle]}>
            <Pressable onPress={() => toggleAttending(isAttending)} style={styles.favouritePressable}>
              <Text style={[styles.addToEventText, isAttending && styles.attendingText]}>{isAttending ? 'Attending' : 'Add Event'}</Text>
            </Pressable>
          </Animated.View>
        )}
        <View style={styles.overlayInd}>
          <View style={styles.eventMetaContainer}>
            <Text style={styles.eventDateChip}>{dayjs(event.event_time).format('ddd, MMM D')}</Text>
          </View>
          <Text style={styles.eventNameInd} numberOfLines={2}>{event.name || 'Event'}</Text>
          <Text style={styles.eventLocationInd} numberOfLines={1}>{event.location || 'Location not available'}</Text>
        </View>
      </ImageBackground>
    </View>
  )
}

export default EventsInfoHeader
