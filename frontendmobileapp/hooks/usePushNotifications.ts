import { useEffect } from "react";
import * as Notifications from "expo-notifications";

import { useAppDispatch } from "@/app/store/hooks";
import { fetchOneEvent } from "@/app/store/Events-store/eventsSlice";
import { fetchChatMessages, fetchFriendList } from "@/app/store/Chat/chatSlice";
import { retrieveOnePost } from "@/app/store/Home-store/feedSlice";
import { changeTabAction, openTabOnTopAction, TabType } from "@/app/store/Navigation/navigationSlice";
import { getNotificationTarget } from "@/app/services/notificationTarget";
import { registerForPushNotifications } from "@/app/services/pushNotifications";

/**
 * While signed in: registers this device for push and opens the right screen when a
 * notification is tapped (including the one that launched the app).
 */
export const usePushNotifications = (isLoggedIn: boolean, currentUserId?: string) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isLoggedIn) return;

    registerForPushNotifications();

    const open = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const target = getNotificationTarget(response.notification.request.content.data);

      switch (target.kind) {
        case "conversation":
          dispatch(fetchChatMessages(target.userId));
          dispatch(fetchFriendList(currentUserId ?? ""));
          dispatch(
            openTabOnTopAction({
              type: TabType.CONVERSATION,
              data: { userId: target.userId, profile_pic: "" },
            }),
          );
          break;
        case "post":
          dispatch(retrieveOnePost({ postID: target.postId }));
          break;
        case "event":
          dispatch(fetchOneEvent({ eventId: target.eventId }));
          break;
        default:
          dispatch(changeTabAction({ type: TabType.NOTIFICATIONS }));
      }
    };

    // Cold start: the app was launched by tapping a notification.
    Notifications.getLastNotificationResponseAsync().then(open);

    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, [isLoggedIn, currentUserId, dispatch]);
};
