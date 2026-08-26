import notificationReducer, {
  fetchUserNotifications,
  setUserNotification,
  setNotificationRequestFailed,
  setFriendRequests,
  changeNotificationPreference,
  setScrollViewPosition,
} from "@/app/store/Notification-store/notificationSlice";
import type { NotificationListResponse } from "@/generated-api";
import type { FriendRequestItem } from "@/app/store/Notification-store/notificationSlice";

const page = (
  notifications: { id: number }[],
  overrides: Partial<NotificationListResponse> = {},
): NotificationListResponse =>
  ({
    notifications,
    current_page: 1,
    per_page: 20,
    total: notifications.length,
    unread: 0,
    ...overrides,
  }) as unknown as NotificationListResponse;

describe("notificationSlice", () => {
  it("marks fetching in-flight, then clears it on success", () => {
    const fetching = notificationReducer(
      undefined,
      fetchUserNotifications({ currentPage: 1, perPage: 20 }),
    );
    expect(fetching.isFetchingNotifications).toBe(true);

    const done = notificationReducer(fetching, setUserNotification(page([{ id: 1 }])));
    expect(done.isFetchingNotifications).toBe(false);
  });

  it("clears the in-flight flag on failure", () => {
    const fetching = notificationReducer(
      undefined,
      fetchUserNotifications({ currentPage: 1, perPage: 20 }),
    );
    const failed = notificationReducer(fetching, setNotificationRequestFailed());
    expect(failed.isFetchingNotifications).toBe(false);
  });

  it("replaces the list on page 1 and stores counts", () => {
    const state = notificationReducer(
      undefined,
      setUserNotification(page([{ id: 1 }, { id: 2 }], { total: 9, unread: 3 })),
    );
    expect(state.allNotifications).toHaveLength(2);
    expect(state.totalNotifications).toBe(9);
    expect(state.unreadNotifications).toBe(3);
  });

  it("appends later pages while de-duplicating by id", () => {
    const first = notificationReducer(undefined, setUserNotification(page([{ id: 1 }, { id: 2 }])));
    const second = notificationReducer(
      first,
      setUserNotification(page([{ id: 2 }, { id: 3 }], { current_page: 2 })),
    );

    expect(second.allNotifications.map((n) => n.id)).toEqual([1, 2, 3]);
  });

  it("toggles a notification preference by key", () => {
    const before = notificationReducer(undefined, { type: "@@INIT" });
    expect(before.notificationPreferences.likes).toBe(true);

    const state = notificationReducer(before, changeNotificationPreference({ key: "likes" }));
    expect(state.notificationPreferences.likes).toBe(false);
  });

  it("stores friend requests and scroll position", () => {
    const requests = [{ keycloak_id: "k1", username: "sam" }] as unknown as FriendRequestItem[];
    let state = notificationReducer(undefined, setFriendRequests(requests));
    state = notificationReducer(state, setScrollViewPosition(80));

    expect(state.activeFriendRequests).toEqual(requests);
    expect(state.scrollViewPosition).toBe(80);
  });
});
