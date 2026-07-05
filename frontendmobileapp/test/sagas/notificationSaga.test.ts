jest.mock("@/generated-api");

import { NotificationsApiFactory } from "@/generated-api";
import notificationSaga from "@/app/store/sagas/notificationSaga";
import notificationReducer, {
  fetchUserNotifications,
} from "@/app/store/Notification-store/notificationSlice";
import { runSagaStore, flushPromises, stopSagas } from "../helpers/sagaTestStore";

const mockedNotificationsApiFactory = NotificationsApiFactory as jest.MockedFunction<
  typeof NotificationsApiFactory
>;

describe("notificationSaga", () => {
  afterEach(() => {
    stopSagas();
    jest.clearAllMocks();
  });

  it("stores fetched notifications and clears the in-flight flag", async () => {
    const getNotificationList = jest.fn().mockResolvedValue({
      data: {
        notifications: [{ id: 1 }, { id: 2 }],
        current_page: 1,
        per_page: 20,
        total: 2,
        unread: 1,
      },
    });
    mockedNotificationsApiFactory.mockReturnValue({ getNotificationList } as any);

    const store = runSagaStore({ notification: notificationReducer }, notificationSaga);
    store.dispatch(fetchUserNotifications({ currentPage: 1, perPage: 20 }));
    await flushPromises();

    expect(getNotificationList).toHaveBeenCalled();
    expect(store.getState().notification.allNotifications).toHaveLength(2);
    expect(store.getState().notification.unreadNotifications).toBe(1);
    expect(store.getState().notification.isFetchingNotifications).toBe(false);
  });

  it("marks the request failed (and clears the flag) when the API rejects", async () => {
    const getNotificationList = jest.fn().mockRejectedValue(new Error("500"));
    mockedNotificationsApiFactory.mockReturnValue({ getNotificationList } as any);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const store = runSagaStore({ notification: notificationReducer }, notificationSaga);
    store.dispatch(fetchUserNotifications({ currentPage: 1, perPage: 20 }));
    await flushPromises();

    expect(store.getState().notification.isFetchingNotifications).toBe(false);
    expect(store.getState().notification.allNotifications).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
