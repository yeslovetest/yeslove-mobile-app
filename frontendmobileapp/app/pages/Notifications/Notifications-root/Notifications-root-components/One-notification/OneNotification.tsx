import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { AppNotification } from '../NotificationsPlaceholders';
import styles from './OneNotificationStyles';

interface OneNotificationProps {
  notification: AppNotification;
}

const OneNotification: React.FC<OneNotificationProps> = ({ notification }) => {
  return (
    <View style={[
      styles.container,
      !notification.opened && styles.activeBackgroundColor
    ]}>
      <View style={!notification.opened && styles.activeIndicator}></View>

      <Image source={notification.profileImage} style={styles.profileImage} />

      <View style={styles.textContainer}>
        <Text style={styles.messageText}>
          <Text style={[styles.username, !notification.opened && styles.usernameUnopened]}>{notification.user}</Text>{' '}
          {notification.notificationMessage}
        </Text>
        <Text style={styles.timeText}>{notification.timeReceived}</Text>
      </View>

      <Image source={notification.postImage} style={styles.postImage} />
    </View>
  );
};

export default OneNotification;

// ... keep styles the same

