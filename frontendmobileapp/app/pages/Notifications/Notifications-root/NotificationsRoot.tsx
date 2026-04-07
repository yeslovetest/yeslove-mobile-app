import React, { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Header from '../../../Universal-components/Header/Header';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import sharedStyles from '@/app/pages/Notifications/NotificationsSharedStyles';
import OneNotification from './Notifications-root-components/One-notification/OneNotification';
import NotificationsPlaceholders from './Notifications-root-components/NotificationsPlaceholders';
import styles from './NotificationsRootStyles';
import { setScrollViewPosition, fetchUserNotifications, fetchFriendRequests } from '@/app/store/Notification-store/notificationSlice';
import { useFocusEffect } from 'expo-router';

type NotificationData = {
  type?: string;
};

const NotificationsRoot = () => {

  const dispatch = useAppDispatch();
  const scrollViewPosition = useAppSelector(state => state.notification.scrollViewPosition);
  const [activeTab, setActiveTab] = useState<'all' | 'friend_requests'>('all');
  const userName = useAppSelector(
    (state) => state.user.name ?? ""
  );
  const notificationList = useAppSelector(state => state.notification.allNotifications);
  const friendRequestList = useAppSelector(state => state.notification.activeFriendRequests);
  const currentPage = useAppSelector(state => state.notification.currentPage);
  const perPage = useAppSelector(state => state.notification.perPage);
  const totalNotifications = useAppSelector(state => state.notification.totalNotifications);
  const unreadNotifications = useAppSelector(state => state.notification.unreadNotifications);
  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(   // maintain previous scroll position after user returns to this screen via the Back button 
    React.useCallback(() => {
      dispatch(fetchUserNotifications({ currentPage: 1, perPage }));
      dispatch(fetchFriendRequests());

      if (scrollViewRef.current && scrollViewPosition > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: scrollViewPosition, animated: false });
        }, 10);
      }
    }, [dispatch, perPage, scrollViewPosition])
  );

  const nonFriendRequestNotifications = notificationList.filter(
    (notification) => ((notification.data ?? {}) as NotificationData).type !== 'friend_request'
  );

  // Keep prefetch distance generous to avoid visible loading gaps while users scroll fast.
  const THRESHOLD = 400;
  
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - THRESHOLD;

    // Persist scroll position so users can continue where they left off.
    dispatch(setScrollViewPosition(contentOffset.y));

    if (activeTab === 'all' && isCloseToBottom && notificationList.length < totalNotifications) {
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
          <View style={styles.tabRow}>
            <TouchableOpacity
              onPress={() => setActiveTab('all')}
              style={[styles.tabButton, activeTab === 'all' ? styles.tabButtonActive : styles.tabButtonInactive]}
            >
              <Text style={[styles.tabButtonText, activeTab === 'all' ? styles.tabButtonTextActive : styles.tabButtonTextInactive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('friend_requests')}
              style={[styles.tabButton, activeTab === 'friend_requests' ? styles.tabButtonActive : styles.tabButtonInactive]}
            >
              <Text style={[styles.tabButtonText, activeTab === 'friend_requests' ? styles.tabButtonTextActive : styles.tabButtonTextInactive]}>
                Friend Requests ({friendRequestList.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'all' && nonFriendRequestNotifications.map((notification, index) => (
          <OneNotification notification={notification} key={`${notification.id}-${index}`} />
        ))}

        {activeTab === 'friend_requests' && friendRequestList.map((request, index) => (
          <OneNotification
            key={`${request.keycloak_id}-${index}`}
            friendRequest={request}
          />
        ))}
      </ScrollView>
    </>
  );
};

export default NotificationsRoot;

