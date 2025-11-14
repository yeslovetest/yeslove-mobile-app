import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { AppNotification } from '../NotificationsPlaceholders';
import { Notification } from '@/generated-api';
import styles from './OneNotificationStyles';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BASE_URL } from '@/app/index';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { openTabOnTopAction, TabType } from '@/app/store/Navigation/navigationSlice';
import { retrieveOnePost, setPostReactionTab } from '@/app/store/Home-store/feedSlice';
import { fetchOneBlogPost } from '@/app/store/Get-help-store/getHelpSlice';
import { fetchOneEvent } from '@/app/store/Events-store/eventsSlice';
import { markNotificationRead } from '@/app/store/Notification-store/notificationSlice';


dayjs.extend(relativeTime);

interface OneNotificationProps {
  notification: Notification;
}

const OneNotification: React.FC<OneNotificationProps> = ({ notification }) => {

  const dispatch = useAppDispatch();
  const onePost = useAppSelector(state => state.feed.detailedPost);
  const oneBlog = useAppSelector(state => state.getHelp.oneBlog);
  const oneEvent = useAppSelector(state => state.events.oneEvent);
  const imageUrl = `${BASE_URL}${notification.data?.image?.startsWith('/') ? '' : '/'}${notification.data?.image}`;
  
  const handleNotificationPress = () => {
    if (['posts', 'comments', 'likes'].includes(notification.type)) {
        dispatch(retrieveOnePost({ postID: notification.data?.post_id ?? 0}));
        if (notification.type === 'likes'){
          dispatch(setPostReactionTab('reactions')); 
        }
        else {
          dispatch(setPostReactionTab('comments'));
        }
        dispatch(markNotificationRead(notification.id));
    }
    else if (notification.type === 'blogs') { 
        dispatch(fetchOneBlogPost({ blogId: notification.data?.blog_id ?? 0}));
        dispatch(markNotificationRead(notification.id))
    }
    else if (notification.type === 'events') { 
        dispatch(fetchOneEvent({ eventId: notification.data?.event_id ?? 0}));
        dispatch(markNotificationRead(notification.id))
    }  
  };
  

  return (
    <TouchableOpacity style={[
      styles.container,
      !notification.is_read && styles.activeBackgroundColor
    ]} onPress={handleNotificationPress}>
      
        
        <View style={!notification.is_read && styles.activeIndicator}></View>
        <Image source={{ uri: imageUrl?? '' }} style={styles.profileImage} />

        <View style={styles.textContainer}>
          <Text style={styles.messageText}>
            <Text style={[styles.username, !notification.is_read && styles.usernameUnopened]}></Text>{' '}
            {notification.body}
          </Text>
          <Text style={styles.timeText}>{dayjs(notification.created_at).fromNow()}</Text>
        </View>

        <Image source={{ uri: imageUrl?? '' }} style={styles.postImage} />
    </TouchableOpacity>
  );
};

export default OneNotification;

// ... keep styles the same

