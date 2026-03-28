import React, { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import styles from '../EventsSharedStyles';
import EventNavbar from './Events-root-components/Events-navbar/EventNavbar';
import Header from '../../../Universal-components/Header/Header';
import OrangeBanner from '@/app/Universal-components/Orange-banner/OrangeBanner';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import UpcomingContent from './Events-root-components/Upcoming/UpcomingContent';
import AttendingContent from './Events-root-components/Attending/AttendingContent';
import AttendedContent from './Events-root-components/Attended/AttendedContent';
import { setEventsScrollViewPosition } from '@/app/store/Events-store/eventsSlice';
import { useFocusEffect } from 'expo-router';
import DateFilterDropdown from './Events-root-components/DateFilter/DateFilter';

type EventTab = 'Upcoming' | 'Attending' | 'Attended';

interface DateRange {
  startDate?: string;
  endDate?: string;
}

const normalizeEventTab = (tab?: string): EventTab => {
  const normalized = (tab || '').toLowerCase();

  if (normalized === 'attending') {
    return 'Attending';
  }

  if (normalized === 'attended') {
    return 'Attended';
  }

  return 'Upcoming';
};


export default function EventsPage() {
      const dispatch = useAppDispatch();
      const activeTab = useAppSelector(state => state.events.view.activeTab);
      const scrollViewPosition = useAppSelector(state => state.events.scrollViewPosition);
      const scrollViewRef = useRef<ScrollView>(null);
      const [isFilterVisible, setIsFilterVisible] = useState(false);
      const [filtersByTab, setFiltersByTab] = useState<Record<EventTab, DateRange>>({
        Upcoming: {},
        Attending: {},
        Attended: {},
      });

      const currentTab = normalizeEventTab(activeTab);
      const activeFilter = filtersByTab[currentTab] || {};

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

      const handleFilterSearch = (dates: DateRange) => {
        setFiltersByTab(prev => ({
          ...prev,
          [currentTab]: dates,
        }));
      };

  return (
    <>
      <Header mainTitle='Yeslove!' onEventsFilterPress={() => setIsFilterVisible(true)}></Header>
      <DateFilterDropdown
        onSearch={handleFilterSearch}
        showTrigger={false}
        visible={isFilterVisible}
        onVisibleChange={setIsFilterVisible}
        initialDates={activeFilter}
      />
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
              {currentTab === "Upcoming" && (
                  <UpcomingContent dates={filtersByTab.Upcoming} />
              )}
        
              {currentTab === "Attending" && (
                <AttendingContent dates={filtersByTab.Attending} />
              )}
        
              {currentTab === "Attended" && (
              <AttendedContent dates={filtersByTab.Attended} />)}
      </ScrollView>
    </>
  );
};


