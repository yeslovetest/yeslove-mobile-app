import { getNotificationTarget } from "@/app/services/notificationTarget";

describe("getNotificationTarget", () => {
  it("opens the conversation for a message push", () => {
    expect(
      getNotificationTarget({ type: "message", sender_keycloak_id: "abc-123", chat_id: 9 }),
    ).toEqual({ kind: "conversation", userId: "abc-123" });
  });

  it("opens the post for a new_post push, accepting string ids from FCM", () => {
    expect(getNotificationTarget({ type: "new_post", post_id: "42" })).toEqual({
      kind: "post",
      postId: 42,
    });
    expect(getNotificationTarget({ type: "new_post", post_id: 7 })).toEqual({
      kind: "post",
      postId: 7,
    });
  });

  it("opens the event for a new_event push", () => {
    expect(getNotificationTarget({ type: "new_event", event_id: 3 })).toEqual({
      kind: "event",
      eventId: 3,
    });
  });

  it.each([
    ["a message without a sender", { type: "message" }],
    ["a post with a bad id", { type: "new_post", post_id: "abc" }],
    ["a post with a zero id", { type: "new_post", post_id: 0 }],
    ["an unknown type", { type: "something_else" }],
    ["no data", undefined],
    ["null data", null],
    ["non-object data", "oops"],
  ])("falls back to the notification list for %s", (_label, data) => {
    expect(getNotificationTarget(data)).toEqual({ kind: "notifications" });
  });
});
