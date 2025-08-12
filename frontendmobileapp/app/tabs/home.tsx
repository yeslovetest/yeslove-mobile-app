import React, { useRef, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import styles from "../../Styles/page-styles/HomeStyles"
import HomeNavBar from '@/components/home-components/HomeNavBar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setScrollViewPosition } from '../store/feedSlice';
import OrangeBanner from '@/components/universal-components/OrangeBanner';
import Header from '../Header';

export default function HomeScreen() {

const scrollViewRef = useRef<ScrollView>(null);
const dispatch = useAppDispatch()
const scrollViewPosition = useAppSelector(state => state.feed.scrollViewPosition);
const scrollToTopAction = useAppSelector(state => state.feed.scrollToTopAction);


useFocusEffect(
  React.useCallback(() => {
    if (scrollViewRef.current && scrollViewPosition > 0) {
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
    <>
    <Header mainTitle="Yeslove!"></Header>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.contentContainer} style={styles.container}
      onScroll={event => {dispatch(setScrollViewPosition(event.nativeEvent.contentOffset.y))}}
      scrollEventThrottle={16}>
                <OrangeBanner icon="newspaper" mainTitle="Newsfeed" description="Share and hear stories" />
        <HomeNavBar />
      </ScrollView>
   </>
  );
}

