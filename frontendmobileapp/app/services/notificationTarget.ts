// Decides where a tapped push notification should take the user. Kept free of React
// and Redux so the routing rules are easy to test.
export type NotificationTarget =
  | { kind: "conversation"; userId: string }
  | { kind: "post"; postId: number }
  | { kind: "event"; eventId: number }
  | { kind: "notifications" };

const toId = (value: unknown): number | null => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const getNotificationTarget = (data: unknown): NotificationTarget => {
  const payload = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;

  switch (payload.type) {
    case "message": {
      const userId = payload.sender_keycloak_id;
      if (typeof userId === "string" && userId) {
        return { kind: "conversation", userId };
      }
      break;
    }
    case "new_post": {
      const postId = toId(payload.post_id);
      if (postId) return { kind: "post", postId };
      break;
    }
    case "new_event": {
      const eventId = toId(payload.event_id);
      if (eventId) return { kind: "event", eventId };
      break;
    }
  }

  // Unknown or incomplete payloads land on the in-app notification list.
  return { kind: "notifications" };
};
