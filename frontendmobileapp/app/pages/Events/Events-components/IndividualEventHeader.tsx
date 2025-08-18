import { View, ImageBackground, Pressable, Text } from "react-native";
import React, { useState } from 'react'
import { Event } from './placeholderEvents';
import styles from "../Events-styles/EventsStyles";
import { useAppSelector } from '@/app/store/hooks';
import AntDesign from '@expo/vector-icons/AntDesign';

const IndividualEventHeader = () => {
  const [isFavourite, setIsFavourite] = useState(false)

  const toggleFavourite = () => {
    setIsFavourite(prev => !prev);
  };

  const event: Event = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as Event;

  return (
    <View>
      <View style={styles.indEventContainer}>
              <ImageBackground style={styles.indEventImg} source={event.image}>
                <Pressable onPress={toggleFavourite} style={styles.favouriteContainer}>
                  {isFavourite ? (
                <AntDesign name="heart" size={26} color="white" />
              ) : (
                <AntDesign name="hearto" size={26} color="white" />
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

export default IndividualEventHeader
