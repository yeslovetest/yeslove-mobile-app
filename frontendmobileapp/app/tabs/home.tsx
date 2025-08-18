import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import UserPostBox from '@/components/home-components/UserPostBox';
import FeedHeader from "@/components/home-components/FeedHeader";
import styles from "../../Styles/page-styles/HomeStyles"
import HomeNavBar from '@/components/home-components/HomeNavBar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setScrollViewPosition } from '../store/feedSlice';

export default function HomeScreen() {

const scrollViewRef = useRef<ScrollView>(null);
const dispatch = useAppDispatch()
const scrollViewPosition = useAppSelector(state => state.feed.scrollViewPosition);
const scrollToTopAction = useAppSelector(state => state.feed.scrollToTopAction);


useFocusEffect(
  React.useCallback(() => {
    if (scrollViewRef.current && scrollViewPosition > 0) {
      // Delay is sometimes needed to ensure rendering is complete
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: scrollViewPosition, animated: false });
      }, 10);
    }
  }, [])
);

useEffect (() => {
  scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  dispatch(setScrollViewPosition(0));
}, [scrollToTopAction]);


  return (
    
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.contentContainer} style={styles.container}
      onScroll={event => {dispatch(setScrollViewPosition(event.nativeEvent.contentOffset.y))}}
      scrollEventThrottle={16}>
        <FeedHeader />
        <UserPostBox />
        <HomeNavBar />
      </ScrollView>
   
  );
}

