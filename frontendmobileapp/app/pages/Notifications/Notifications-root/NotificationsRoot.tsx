import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import Header from '../../../Universal-components/Header/Header';
import { useAppSelector } from '../../../store/hooks';
import sharedStyles from '@/app/pages/Notifications/NotificationsSharedStyles';
import OneNotification from './Notifications-root-components/One-notification/OneNotification';
import NotificationsPlaceholders from './Notifications-root-components/NotificationsPlaceholders';
import styles from './NotificationsRootStyles';

const NotificationsRoot = () => {

  const userName = useAppSelector(
    (state) => state.user.name ?? ""
  );

  const notificationList = useAppSelector(state => state.notification.allNotifications);
  const currentPage = useAppSelector(state => state.notification.currentPage);
  const perPage = useAppSelector(state => state.notification.perPage);
  const totalNotifications = useAppSelector(state => state.notification.totalNotifications);
  const unreadNotifications = useAppSelector(state => state.notification.unreadNotifications);

  return (
    <>
      <Header mainTitle={userName} />
      <ScrollView
        contentContainerStyle={sharedStyles.contentContainer}
        style={sharedStyles.container}
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
