import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Notification } from '@/generated-api';
import styles from './OneNotificationStyles';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BASE_URL } from '@/app/config/baseUrl';
import { useAppDispatch } from '@/app/store/hooks';
import { retrieveOnePost, setPostReactionTab } from '@/app/store/Home-store/feedSlice';
import { fetchOneBlogPost } from '@/app/store/Get-help-store/getHelpSlice';
import { fetchOneEvent } from '@/app/store/Events-store/eventsSlice';
import { markNotificationRead, FriendRequestItem, respondToFriendRequest } from '@/app/store/Notification-store/notificationSlice';


dayjs.extend(relativeTime);

interface OneNotificationProps {
  notification?: Notification;
  friendRequest?: FriendRequestItem;
}

type NotificationData = {
  type?: string;
  username?: string;
  image?: string;
  post_id?: number;
  blog_id?: number;
  event_id?: number;
};

const OneNotification: React.FC<OneNotificationProps> = ({ notification, friendRequest }) => {

  const dispatch = useAppDispatch();
  const [isFriendRequestModalVisible, setFriendRequestModalVisible] = useState(false);
  const [isFollowModalVisible, setFollowModalVisible] = useState(false);
  const notificationData = (notification?.data ?? {}) as NotificationData;
  const imagePath = friendRequest?.image ?? notificationData.image;
  const imageUrl = imagePath ? `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}` : '';

  if (!notification && !friendRequest) {
    return null;
  }

  const isFriendRequestItem = !!friendRequest;
  const isFollowNotification =
    !isFriendRequestItem &&
    !!notification &&
    (notification.type === 'follows' || notificationData.type === 'follow');
  const followUserName =
    typeof notificationData.username === 'string' && notificationData.username.trim().length > 0
      ? notificationData.username
      : 'Someone';

  const handleRespond = (decision: 'accept' | 'decline') => {
    if (!friendRequest?.keycloak_id) {
      return;
    }
    dispatch(respondToFriendRequest({ keycloakId: friendRequest.keycloak_id, decision }));
    setFriendRequestModalVisible(false);
  };
  
  const handleNotificationPress = () => {
    if (isFriendRequestItem) {
      setFriendRequestModalVisible(true);
      return;
    }

    if (!notification) {
      return;
    }

    if (isFollowNotification) {
      setFollowModalVisible(true);
      if (!notification.is_read && typeof notification.id === 'number') {
        // Follow notifications stay on this screen, so mark as read when modal opens.
        dispatch(markNotificationRead(notification.id));
      }
      return;
    }

    if (['posts', 'comments', 'likes'].includes(notification.type ?? '')) {
        dispatch(retrieveOnePost({ postID: notificationData.post_id ?? 0}));
        if (notification.type === 'likes'){
          dispatch(setPostReactionTab('reactions')); 
        }
        else {
          dispatch(setPostReactionTab('comments'));
        }
        if (typeof notification.id === 'number') {
          dispatch(markNotificationRead(notification.id));
        }
    }
    else if (notification.type === 'blogs') { 
        dispatch(fetchOneBlogPost({ blogId: notificationData.blog_id ?? 0}));
        if (typeof notification.id === 'number') {
          dispatch(markNotificationRead(notification.id));
        }
    }
    else if (notification.type === 'events') { 
        dispatch(fetchOneEvent({ eventId: notificationData.event_id ?? 0}));
        if (typeof notification.id === 'number') {
          dispatch(markNotificationRead(notification.id));
        }
    }  
  };
  

  return (
    <>
    <TouchableOpacity style={[
      styles.container,
      (!isFriendRequestItem && notification && !notification.is_read) && styles.activeBackgroundColor
    ]} onPress={handleNotificationPress}>
      
        
        <View style={(!isFriendRequestItem && notification && !notification.is_read) ? styles.activeIndicator : undefined}></View>
        <Image source={{ uri: imageUrl?? '' }} style={styles.profileImage} />

        <View style={styles.textContainer}>
          <Text style={styles.messageText}>
            <Text style={[styles.username, (!isFriendRequestItem && notification && !notification.is_read) && styles.usernameUnopened]}>
              {friendRequest?.username ?? ''}
            </Text>{' '}
            {isFriendRequestItem ? 'sent you a friend request' : notification?.body}
          </Text>
          {!isFriendRequestItem && notification?.created_at && (
            <Text style={styles.timeText}>{dayjs(notification.created_at).fromNow()}</Text>
          )}
        </View>

        <Image source={{ uri: imageUrl?? '' }} style={styles.postImage} />
    </TouchableOpacity>

    {isFriendRequestItem && (
      <Modal
        visible={isFriendRequestModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFriendRequestModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setFriendRequestModalVisible(false)}
        >
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>Friend request</Text>
            <Text style={styles.modalBody}>{friendRequest?.username ?? 'User'} wants to connect as a friend.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.declineButton} onPress={() => handleRespond('decline')}>
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={() => handleRespond('accept')}>
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    )}

    {isFollowNotification && (
      <Modal
        visible={isFollowModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFollowModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setFollowModalVisible(false)}
        >
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>You have a new follower</Text>
            <Image source={{ uri: imageUrl ?? '' }} style={styles.profileImage} />
            <Text style={styles.modalBody}>{followUserName} is now following your updates.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.acceptButton} onPress={() => setFollowModalVisible(false)}>
                <Text style={styles.acceptButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    )}
    </>
  );
};

export default OneNotification;

// ... keep styles the same

