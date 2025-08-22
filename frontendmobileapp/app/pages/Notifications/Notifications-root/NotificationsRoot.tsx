import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import Header from '../../../Universal-components/Header/Header';
import { useAppSelector } from '../../../store/hooks';
import sharedStyles from '@/app/pages/Notifications/NotificationsSharedStyles';
import OneNotification from './Notifications-root-components/One-notification/OneNotification';
import NotificationsPlaceholders from './Notifications-root-components/NotificationsPlaceholders';
import styles from './NotificationsRootStyles';

const NotificationsRoot = () => {
  const userId = useAppSelector(
    (state) => state.navigation.tabStack.at(-1)?.data?.userId
  );
  const userName = useAppSelector(
    (state) => state.profile.profiles[userId]?.username ?? ""
  );

  return (
    <>
      <Header mainTitle={userName} />
      <ScrollView
        contentContainerStyle={sharedStyles.contentContainer}
        style={sharedStyles.container}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.noOfNotifications}>You have <Text style={styles.blueText}>2 notfications</Text> today</Text>
          <Text style={styles.todayAndThisWeekText}>Today</Text>
        </View>

        {NotificationsPlaceholders.map((notification, index) => (
          <OneNotification notification={notification} key={index} />
        ))}

        <View style={styles.headerRow}>

          <Text style={styles.todayAndThisWeekText}>This week</Text>
        </View>
        
        {NotificationsPlaceholders.map((notification, index) => (
          <OneNotification notification={notification} key={index} />
        ))}
      </ScrollView>
    </>
  );
};

export default NotificationsRoot;
