import React, { useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View, Text } from 'react-native';
import Header from '../../../Universal-components/Header/Header';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import sharedStyles from '@/app/pages/Notifications/NotificationsSharedStyles';
import OneNotification from './Notifications-root-components/One-notification/OneNotification';
import NotificationsPlaceholders from './Notifications-root-components/NotificationsPlaceholders';
import styles from './NotificationsRootStyles';
import { setScrollViewPosition, fetchUserNotifications } from '@/app/store/Notification-store/notificationSlice';
import { useFocusEffect } from 'expo-router';

const NotificationsRoot = () => {

  const dispatch = useAppDispatch();
  const scrollViewPosition = useAppSelector(state => state.notification.scrollViewPosition);
  const userName = useAppSelector(
    (state) => state.user.name ?? ""
  );
  const notificationList = useAppSelector(state => state.notification.allNotifications);
  const currentPage = useAppSelector(state => state.notification.currentPage);
  const perPage = useAppSelector(state => state.notification.perPage);
  const totalNotifications = useAppSelector(state => state.notification.totalNotifications);
  const unreadNotifications = useAppSelector(state => state.notification.unreadNotifications);
  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(   // maintain previous scroll position after user returns to this screen via the Back button 
    React.useCallback(() => {
      if (scrollViewRef.current && scrollViewPosition > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: scrollViewPosition, animated: false });
        }, 10);
      }
    }, [])
  );

  // Keep prefetch distance generous to avoid visible loading gaps while users scroll fast.
  const THRESHOLD = 400;
  
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - THRESHOLD;

    // Persist scroll position so users can continue where they left off.
    dispatch(setScrollViewPosition(contentOffset.y));

    if (isCloseToBottom && notificationList.length < totalNotifications) {
      dispatch(fetchUserNotifications({currentPage: currentPage + 1, perPage: perPage}));
      
    }
  };

  return (
    <>
      <Header mainTitle={userName} />
      <ScrollView
        ref = {scrollViewRef}
        contentContainerStyle={sharedStyles.contentContainer}
        style={sharedStyles.container}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.noOfNotifications}>You have <Text style={styles.blueText}>{unreadNotifications} unread notfications</Text></Text>
        </View>

        {notificationList.map((notification, index) => (
          <OneNotification notification={notification} key={index} />
        ))}
      </ScrollView>
    </>
  );
};

export default NotificationsRoot;

