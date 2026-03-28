import React, { useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import styles from '../EventsSharedStyles';
import EventNavbar from './Events-root-components/Events-navbar/EventNavbar';
import Header from '../../../Universal-components/Header/Header';
import OrangeBanner from '@/app/Universal-components/Orange-banner/OrangeBanner';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import EventsList from './Events-root-components/Events-list/EventsList';
import UpcomingContent from './Events-root-components/Upcoming/UpcomingContent';
import AttendingContent from './Events-root-components/Attending/AttendingContent';
import AttendedContent from './Events-root-components/Attended/AttendedContent';
import { setEventsScrollViewPosition } from '@/app/store/Events-store/eventsSlice';
import { useFocusEffect } from 'expo-router';


export default function EventsPage() {
      const dispatch = useAppDispatch();
      const activeTab = useAppSelector(state => state.events.view.activeTab);
      const scrollViewPosition = useAppSelector(state => state.events.scrollViewPosition);
      const scrollViewRef = useRef<ScrollView>(null);

      useFocusEffect(
        React.useCallback(() => {
          let restoreTimer: ReturnType<typeof setTimeout> | undefined;
          if (scrollViewRef.current && scrollViewPosition > 0) {
            restoreTimer = setTimeout(() => {
              scrollViewRef.current?.scrollTo({ y: scrollViewPosition, animated: false });
            }, 10);
          }

          return () => {
            if (restoreTimer) {
              clearTimeout(restoreTimer);
            }
          };
        }, [])
      );

      const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        dispatch(setEventsScrollViewPosition(event.nativeEvent.contentOffset.y));
      };

  return (
    <>
      <Header mainTitle='Yeslove!'></Header>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.contentContainer}
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <OrangeBanner icon="icons" description="Browse our past and future events" mainTitle="Our Events" />
        <EventNavbar />
              {activeTab === "Upcoming" && (
                  <UpcomingContent />
              )}
        
              {activeTab === "Attending" && (
                <AttendingContent />
              )}
        
              {activeTab === "Attended" && (
              <AttendedContent />)}
      </ScrollView>
    </>
  );
};


